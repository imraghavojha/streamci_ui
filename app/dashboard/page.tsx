// app/dashboard/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useUser, UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import {
  BarChart3,
  Bell,
  Clock,
  GitBranch,
  TrendingUp,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Loader2,
  CheckCircle,
  Activity,
  Settings
} from "lucide-react"
import { DashboardChart } from "@/components/dashboard-chart"
import { LiveBuildStatus } from "@/components/live-build-status"
import { BuildHistory } from "@/components/build-history"
import { api, DashboardSummary, RealtimeDashboard, WebSocketService } from "@/lib/api"

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [realtimeData, setRealtimeData] = useState<RealtimeDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [selectedRepos, setSelectedRepos] = useState<string[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false) // state for refresh animation

  // effect for initial load, websocket, and polling
  useEffect(() => {
    if (isLoaded && user?.id) {
      fetchRealtimeDashboard()

      const ws = new WebSocketService()
      ws.connect((update) => {
        fetchRealtimeDashboard() // fetch on websocket update
      })

      const interval = setInterval(() => {
        fetchRealtimeDashboard() // regular polling
      }, 30000)

      return () => {
        ws.disconnect()
        clearInterval(interval)
      }
    }
  }, [isLoaded, user?.id])

  // effect to handle refresh param from repo selection page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('refresh') === 'true') {
      fetchRealtimeDashboard(true) // force refresh
      // clean up url
      window.history.replaceState({}, '', '/dashboard')
    }
  }, []) // run only once on mount

  const fetchRealtimeDashboard = async (force = false) => {
    if (!user?.id) return

    try {
      // only show full loading state on initial load, not background refresh
      if (!realtimeData || force) {
        setLoading(true)
      }
      setError(null)

      const data = force
        ? await api.refreshRealtimeDashboard(user.id)
        : await api.getRealtimeDashboard(user.id)

      setRealtimeData(data)
      setLastUpdated(new Date().toLocaleTimeString())
      setSelectedRepos(data.selectedRepos || [])

      const dashboardSummary = api.convertWorkflowsToDashboard(data)
      setSummary(dashboardSummary)

    } catch (err: any) {
      const errorMessage = err.message || 'unknown error occurred'
      setError(`connection failed: ${errorMessage}`)

      // provide a default empty state on error
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
      setRealtimeData({ workflows: [], lastUpdated: '', totalWorkflows: 0 }) // clear workflow data on error
    } finally {
      setLoading(false)
    }
  }

  // handler for the refresh button click
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchRealtimeDashboard(true) // force fetch
    // keep animation for a bit for visual feedback
    setTimeout(() => setIsRefreshing(false), 500)
  }

  // loading state while clerk initializes
  if (!isLoaded || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">StreamCI Dashboard</h1>
              {lastUpdated && (
                <p className="text-sm text-muted-foreground">
                  Last updated: {lastUpdated}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/repositories">
                <Button variant="outline" size="sm">
                  <GitBranch className="w-4 h-4 mr-2" />
                  Manage Repos
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing || loading} // disable during initial load too
                className="transition-all"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing || loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <UserButton />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">
        {/* selected repositories */}
        {selectedRepos.length > 0 && !loading && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                Monitoring {selectedRepos.length} {selectedRepos.length === 1 ? 'Repository' : 'Repositories'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedRepos.map((repo) => (
                  <Badge key={repo} variant="secondary">
                    {repo}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* no repos selected prompt */}
        {selectedRepos.length === 0 && !loading && !error && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <GitBranch className="w-8 h-8 text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium text-blue-900">No repositories selected</p>
                  <p className="text-sm text-blue-700">Select repositories to start monitoring your workflows</p>
                </div>
                <Link href="/repositories">
                  <Button>
                    Select Repositories
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* connection error */}
        {error && !loading && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-900">Connection Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* loading state */}
        {loading && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <p>Loading dashboard data...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* dashboard content */}
        {summary && !loading && (
          <>
            {/* overview cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl font-bold text-green-600">
                      {summary.overview.total_success_rate}%
                    </div>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Builds
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl font-bold">
                      {summary.overview.total_builds}
                    </div>
                    <BarChart3 className="w-4 h-4 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Builds Today
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl font-bold">
                      {summary.recent_activity.builds_last_24h}
                    </div>
                    <Activity className="w-4 h-4 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl font-bold text-red-600">
                      {summary.active_alerts.length}
                    </div>
                    <Bell className="w-4 h-4 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* charts and status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DashboardChart />
              <LiveBuildStatus />
            </div>

            {/* build history */}
            <BuildHistory workflows={realtimeData?.workflows || []} />

            {/* analytics */}
            {user?.id && <AnalyticsDashboard clerkUserId={user.id} />}

            {/* active alerts */}
            {summary.active_alerts.length > 0 && (
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="font-serif flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    <span>Active Alerts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {summary.active_alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <Badge variant={alert.severity === 'error' ? 'destructive' : 'default'}>
                            {alert.severity}
                          </Badge>
                          <div>
                            <p className="font-medium">{alert.message}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(alert.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}