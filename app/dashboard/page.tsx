"use client"

import { useState, useEffect } from "react"
import { useUser, UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  Bell,
  ChevronDown,
  Clock,
  GitBranch,
  TrendingUp,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Loader2,
} from "lucide-react"
import { DashboardChart } from "@/components/dashboard-chart"
import { LiveBuildStatus } from "@/components/live-build-status"
import { RecentActivity } from "@/components/recent-activity"
import { api, DashboardSummary, WebSocketService } from "@/lib/api"

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wsService] = useState(() => new WebSocketService())

  const fetchDashboardSummary = async () => {
    try {
      setLoading(true)
      const data = await api.getDashboardSummary()

      // extra safety check for data structure
      if (data && typeof data === 'object') {
        setSummary(data)
        setError(null)
      } else {
        throw new Error('invalid api response structure')
      }
    } catch (err) {
      console.error('failed to fetch dashboard summary:', err)
      setError('unable to connect to backend api')

      // set fallback summary data so ui doesn't break
      setSummary({
        timestamp: new Date().toISOString(),
        status: 'offline',
        total_pipelines: 3,
        overview: {
          total_success_rate: 94.2,
          total_builds: 1247,
          total_successful_builds: 1175,
          total_failed_builds: 72,
        },
        recent_activity: {
          builds_last_24h: 25,
          successful_builds_last_24h: 23,
          failed_builds_last_24h: 2,
        },
        active_alerts: [
          {
            id: 1,
            type: 'connection',
            severity: 'warning',
            message: 'backend api not available - showing demo data',
            created_at: new Date().toISOString(),
          }
        ],
        pipelines: [],
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      await api.refreshDashboard()
      await fetchDashboardSummary()
    } catch (err) {
      console.error('failed to refresh dashboard:', err)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardSummary()

    // setup websocket for live updates - with graceful error handling
    try {
      wsService.connect(
        (data) => {
          console.log('websocket update received:', data)
          // refresh data when websocket message received
          fetchDashboardSummary()
        },
        (error) => {
          console.log('websocket connection failed, using polling instead')
          // don't throw error - just continue with polling
        }
      )
    } catch (error) {
      console.log('websocket setup failed, using polling only')
    }

    // auto refresh every 5 minutes
    const interval = setInterval(fetchDashboardSummary, 5 * 60 * 1000)

    return () => {
      clearInterval(interval)
      try {
        wsService.disconnect()
      } catch (error) {
        // ignore disconnect errors
      }
    }
  }, [wsService])

  // helper functions
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }

  const getSuccessRate = (): string => {
    if (!summary || !summary.overview || typeof summary.overview.total_success_rate !== 'number') {
      return "0.0%"
    }
    return `${summary.overview.total_success_rate.toFixed(1)}%`
  }

  const getAvgDuration = (): string => {
    if (!summary) return "0m 0s"
    // calculate average from total builds - mock calculation for now
    const avgSeconds = Math.floor(Math.random() * 300) + 120 // 2-7 minutes
    return formatDuration(avgSeconds)
  }

  // show loading while user data loads
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  // redirect to sign-in if not authenticated (this should be handled by middleware, but just in case)
  if (!user) {
    window.location.href = '/sign-in'
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with User Authentication */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-serif font-bold">StreamCI</span>
            </div>
            <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
              <span>main-pipeline</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>

          {/* User info and controls */}
          <div className="flex items-center space-x-4">
            {/* welcome message */}
            <div className="hidden md:block text-sm text-muted-foreground">
              Welcome back, {user.firstName || user.username || 'Developer'}
            </div>

            {/* refresh button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
            </Button>

            {/* notifications */}
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
              {summary && summary.active_alerts.length > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </Button>

            {/* user button from clerk */}
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8"
                }
              }}
              afterSignOutUrl="/"
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-500">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardSummary}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Pipeline Health Score */}
        <div className="mb-8">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-serif">Pipeline Health Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">
                {loading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  getSuccessRate()
                )}
              </div>
              <p className="text-muted-foreground">
                {summary ? `${summary.total_pipelines} pipelines monitored` : "Loading..."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-green-500">
                    {loading ? "..." : getSuccessRate()}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Duration</p>
                  <p className="text-2xl font-bold">
                    {loading ? "..." : getAvgDuration()}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Builds</p>
                  <p className="text-2xl font-bold">
                    {loading ? "..." : summary?.overview.total_builds.toLocaleString() || "0"}
                  </p>
                </div>
                <GitBranch className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Alerts</p>
                  <p className="text-2xl font-bold text-yellow-500">
                    {loading ? "..." : summary?.active_alerts.length || "0"}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Live Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <DashboardChart />
          <LiveBuildStatus />
        </div>

        {/* Recent Activity and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity />
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-serif flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <span>Active Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : summary && summary.active_alerts.length > 0 ? (
                summary.active_alerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {alert.type} • {new Date(alert.created_at).toLocaleDateString()}
                      </p>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {alert.severity}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No active alerts</p>
                  <p className="text-sm text-muted-foreground mt-1">All systems running smoothly</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}