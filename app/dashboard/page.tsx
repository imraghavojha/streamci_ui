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
  ChevronDown,
  Clock,
  GitBranch,
  TrendingUp,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Loader2,
  CheckCircle,
  Activity,
} from "lucide-react"
import { DashboardChart } from "@/components/dashboard-chart"
import { LiveBuildStatus } from "@/components/live-build-status"
import { RecentActivity } from "@/components/recent-activity"
import { api, DashboardSummary, RealtimeDashboard, WebSocketService } from "@/lib/api"

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [realtimeData, setRealtimeData] = useState<RealtimeDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [wsService] = useState(() => new WebSocketService())

  const fetchRealtimeDashboard = async (force = false) => {
    if (!user?.id) return

    try {
      setLoading(!force) // don't show loading spinner for force refresh
      setError(null)

      // if force refresh, use refresh endpoint to clear cache
      const data = force
        ? await api.refreshRealtimeDashboard(user.id)
        : await api.getRealtimeDashboard(user.id)

      setRealtimeData(data)
      setLastUpdated(new Date().toLocaleTimeString())

      // convert workflow data to dashboard summary format
      const dashboardSummary = api.convertWorkflowsToDashboard(data)
      setSummary(dashboardSummary)

    } catch (err) {
      console.error('failed to fetch realtime dashboard:', err)
      setError('failed to connect to backend - check if server is running')

      // fallback to empty state
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
        active_alerts: [{
          id: 1,
          type: 'connection',
          severity: 'error',
          message: 'unable to connect to backend api',
          created_at: new Date().toISOString(),
        }],
        pipelines: [],
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchRealtimeDashboard(true) // force refresh
    setRefreshing(false)
  }

  useEffect(() => {
    if (user?.id) {
      fetchRealtimeDashboard()
    }
  }, [user?.id])

  useEffect(() => {
    // setup websocket and polling
    try {
      wsService.connect(
        (data) => {
          console.log('websocket update received:', data)
          fetchRealtimeDashboard()
        },
        (error) => {
          console.log('websocket connection failed, using polling instead')
        }
      )
    } catch (error) {
      console.log('websocket setup failed, using polling only')
    }

    // auto refresh every 1 minute for real-time data
    const interval = setInterval(() => {
      if (user?.id) {
        fetchRealtimeDashboard()
      }
    }, 60 * 1000) // 1 minute

    return () => {
      clearInterval(interval)
      try {
        wsService.disconnect()
      } catch (error) {
        // ignore disconnect errors
      }
    }
  }, [user?.id, wsService])

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600'
      case 'failure': return 'text-red-600'
      case 'in_progress': return 'text-blue-600'
      case 'queued': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'failure': return <XCircle className="w-4 h-4 text-red-600" />
      case 'in_progress': return <Activity className="w-4 h-4 text-blue-600" />
      case 'queued': return <Clock className="w-4 h-4 text-yellow-600" />
      default: return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  // get tracked repositories from realtime data
  const getTrackedRepos = () => {
    if (!realtimeData?.selectedRepos) return []
    return realtimeData.selectedRepos
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    window.location.href = '/sign-in'
    return null
  }

  const trackedRepos = getTrackedRepos()

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

            {/* Navigation */}
            <div className="flex items-center space-x-2">
              <Button variant="outline" asChild>
                <Link href="/repositories" className="flex items-center space-x-2">
                  <GitBranch className="w-4 h-4" />
                  <span>repositories</span>
                </Link>
              </Button>

              <Button variant="outline" className="flex items-center space-x-2 bg-primary/10">
                <span>dashboard</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* User info and controls */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-sm text-muted-foreground">
              Welcome back, {user.firstName || user.username || 'Developer'}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Force refresh data"
            >
              {refreshing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>

            <UserButton />
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">loading real-time data...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Dashboard Header with Tracked Repos */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Real-Time Dashboard</h1>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-muted-foreground">
                    {lastUpdated && <>Updated: {lastUpdated}</>}
                  </p>
                  {trackedRepos.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Tracking:</span>
                      {trackedRepos.map((repo) => (
                        <Badge key={repo} variant="outline" className="text-xs">
                          {repo}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {realtimeData && (
                <Badge variant={realtimeData.error ? "destructive" : "default"}>
                  {realtimeData.totalWorkflows} workflows tracked
                </Badge>
              )}
            </div>

            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Main Metrics */}
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{getSuccessRate()}</div>
                    <div className="text-xs text-muted-foreground">from selected repos</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Builds</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summary.overview.total_builds}</div>
                    <div className="text-xs text-muted-foreground">recent workflows</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Repositories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{trackedRepos.length}</div>
                    <div className="text-xs text-muted-foreground">being monitored</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Failed Builds</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{summary.overview.total_failed_builds}</div>
                    <div className="text-xs text-muted-foreground">need attention</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Live Workflows */}
            {realtimeData && realtimeData.workflows && realtimeData.workflows.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Recent Workflow Runs
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={refreshing}
                    >
                      {refreshing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      Refresh
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {realtimeData.workflows.slice(0, 10).map((workflow) => (
                      <div key={workflow.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(workflow.conclusion || workflow.status)}
                          <div>
                            <div className="font-medium">{workflow.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {workflow.repository} • {new Date(workflow.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className={`text-sm font-medium ${getStatusColor(workflow.conclusion || workflow.status)}`}>
                          {workflow.conclusion || workflow.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Data State */}
            {realtimeData && (!realtimeData.workflows || realtimeData.workflows.length === 0) && (
              <Card>
                <CardContent className="text-center py-12">
                  <GitBranch className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No workflow data found</h3>
                  <p className="text-muted-foreground mb-4">
                    Make sure you have selected repositories with GitHub Actions workflows.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button asChild>
                      <Link href="/repositories">Select Repositories</Link>
                    </Button>
                    <Button variant="outline" onClick={handleRefresh}>
                      Refresh Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Analytics Section */}
            {user?.id && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Analytics & Trends</h2>
                <AnalyticsDashboard clerkUserId={user.id} />
              </div>
            )}
          </div>

        )}
      </div>
    </div>
  )
}