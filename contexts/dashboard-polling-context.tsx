"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useUser } from '@clerk/nextjs'
import { api, RealtimeDashboard, DashboardSummary, WebSocketService } from '@/lib/api'

interface DashboardData {
    realtimeData: RealtimeDashboard | null
    summary: DashboardSummary | null
    loading: boolean
    error: string | null
    lastUpdated: string
    refresh: (force?: boolean) => Promise<void>
    isRefreshing: boolean
}

const DashboardPollingContext = createContext<DashboardData | undefined>(undefined)

export function DashboardPollingProvider({ children }: { children: ReactNode }) {
    const { user, isLoaded } = useUser()
    const [realtimeData, setRealtimeData] = useState<RealtimeDashboard | null>(null)
    const [summary, setSummary] = useState<DashboardSummary | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [lastUpdated, setLastUpdated] = useState<string>("")
    const [isRefreshing, setIsRefreshing] = useState(false)

    const fetchData = async (force = false) => {
        if (!user?.id) return

        try {
            if (!realtimeData || force) {
                setLoading(true)
            }
            setError(null)

            const data = force
                ? await api.refreshRealtimeDashboard(user.id)
                : await api.getRealtimeDashboard(user.id)

            setRealtimeData(data)
            setLastUpdated(new Date().toLocaleTimeString())

            const dashboardSummary = api.convertWorkflowsToDashboard(data)
            setSummary(dashboardSummary)

        } catch (err: any) {
            setError(`Connection failed: ${err.message || 'Unknown error'}`)
            setSummary({
                timestamp: new Date().toISOString(),
                status: 'offline',
                total_pipelines: 0,
                overview: {
                    total_success_rate: 0,
                    total_builds: 0,
                    total_successful_builds: 0,
                    total_failed_builds: 0,
                },
                recent_activity: {
                    builds_last_24h: 0,
                    successful_builds_last_24h: 0,
                    failed_builds_last_24h: 0,
                },
                active_alerts: [],
                pipelines: []
            })
            setRealtimeData({ workflows: [], lastUpdated: '', totalWorkflows: 0 })
        } finally {
            setLoading(false)
        }
    }

    const refresh = async (force = true) => {
        setIsRefreshing(true)
        await fetchData(force)
        setTimeout(() => setIsRefreshing(false), 500)
    }

    useEffect(() => {
        if (isLoaded && user?.id) {
            fetchData() // initial load only

            // websocket with better logging
            const ws = new WebSocketService()

            ws.connect(
                (update) => {
                    console.log('🔔 WebSocket update received:', update)
                    fetchData() // only fetch on actual websocket events
                },
                (error) => {
                    console.error('❌ WebSocket error:', error)
                }
            )

            // check if connected after 3 seconds
            setTimeout(() => {
                if (ws.isConnected()) {
                    console.log('✅ WebSocket successfully connected')
                } else {
                    console.warn('⚠️ WebSocket not connected after 3 seconds')
                }
            }, 3000)

            return () => {
                console.log('🔌 Disconnecting WebSocket...')
                ws.disconnect()
            }
        }
    }, [isLoaded, user?.id])

    // handle refresh param from repo selection page
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        if (params.get('refresh') === 'true') {
            fetchData(true) // force refresh when returning from repo selection
            window.history.replaceState({}, '', '/dashboard')
        }
    }, [])

    return (
        <DashboardPollingContext.Provider
            value={{
                realtimeData,
                summary,
                loading,
                error,
                lastUpdated,
                refresh,
                isRefreshing
            }}
        >
            {children}
        </DashboardPollingContext.Provider>
    )
}

export function useDashboardData() {
    const context = useContext(DashboardPollingContext)
    if (context === undefined) {
        throw new Error('useDashboardData must be used within DashboardPollingProvider')
    }
    return context
}
