"use client"
import { ApiConnectivityTester } from "@/components/api-connectivity-tester"
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
  Bug,
  Zap
} from "lucide-react"
import { DashboardChart } from "@/components/dashboard-chart"
import { LiveBuildStatus } from "@/components/live-build-status"
import { RecentActivity } from "@/components/recent-activity"
import { api, DashboardSummary, RealtimeDashboard, WebSocketService } from "@/lib/api"

// DEBUG COMPONENT - Shows all debugging info
function DebugPanel({
  user,
  summary,
  realtimeData,
  error,
  loading,
  lastUpdated,
  diagnostics
}: any) {
  const [showDebug, setShowDebug] = useState(false)

  return (
    <Card className="mb-4 border-yellow-200 bg-yellow-50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bug className="w-4 h-4" />
            Debug Information
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
          >
            {showDebug ? 'Hide' : 'Show'} Debug
          </Button>
        </div>
      </CardHeader>
      {showDebug && (
        <CardContent className="text-xs space-y-4">
          {/* Environment Check */}
          <div>
            <h4 className="font-semibold text-green-700">Environment Variables:</h4>
            <div className="bg-gray-100 p-2 rounded mt-1 font-mono">
              <div>NEXT_PUBLIC_API_URL: {process.env.NEXT_PUBLIC_API_URL || "❌ NOT SET"}</div>
              <div>NODE_ENV: {process.env.NODE_ENV}</div>
              <div>VERCEL_ENV: {process.env.VERCEL_ENV || "not in vercel"}</div>
            </div>
          </div>

          {/* User State */}
          <div>
            <h4 className="font-semibold text-blue-700">User State:</h4>
            <div className="bg-gray-100 p-2 rounded mt-1">
              <div>User ID: {user?.id || "❌ NO USER"}</div>
              <div>User loaded: {user ? "✅" : "❌"}</div>
              <div>Email: {user?.primaryEmailAddress?.emailAddress || "N/A"}</div>
            </div>
          </div>

          {/* API Status */}
          <div>
            <h4 className="font-semibold text-purple-700">API Status:</h4>
            <div className="bg-gray-100 p-2 rounded mt-1">
              <div>Loading: {loading ? "✅ YES" : "❌ NO"}</div>
              <div>Error: {error ? `🚨 ${error}` : "✅ NONE"}</div>
              <div>Last Updated: {lastUpdated || "❌ NEVER"}</div>
              <div>Summary exists: {summary ? "✅ YES" : "❌ NO"}</div>
              <div>Realtime data exists: {realtimeData ? "✅ YES" : "❌ NO"}</div>
            </div>
          </div>

          {/* Data Preview */}
          {summary && (
            <div>
              <h4 className="font-semibold text-indigo-700">Summary Data:</h4>
              <div className="bg-gray-100 p-2 rounded mt-1 max-h-32 overflow-auto">
                <pre className="text-xs">{JSON.stringify(summary, null, 2)}</pre>
              </div>
            </div>
          )}

          {diagnostics && (
            <div>
              <h4 className="font-semibold text-red-700">Diagnostics Results:</h4>
              <div className="bg-gray-100 p-2 rounded mt-1">
                {Object.entries(diagnostics).map(([test, result]) => (
                  <div key={test}>
                    {test}: {result ? "✅ PASS" : "❌ FAIL"}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [realtimeData, setRealtimeData] = useState<RealtimeDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [wsService] = useState(() => new WebSocketService())
  const [diagnostics, setDiagnostics] = useState<any>(null)

  // DEBUG: Log all state changes
  useEffect(() => {
    console.log("🎯 DASHBOARD STATE CHANGE:")
    console.log("- User loaded:", isLoaded, "User ID:", user?.id)
    console.log("- Loading:", loading)
    console.log("- Error:", error)
    console.log("- Summary exists:", !!summary)
    console.log("- Realtime data exists:", !!realtimeData)
    console.log("- Last updated:", lastUpdated)
  }, [user, isLoaded, loading, error, summary, realtimeData, lastUpdated])

  const runDiagnostics = async () => {
    console.log("🔍 Starting comprehensive diagnostics...")
    try {
      const results = await api.runDiagnostics()
      setDiagnostics(results)
      console.log("🔍 Diagnostics completed:", results)
    } catch (e) {
      console.error("🔍 Diagnostics failed:", e)
      setDiagnostics({ error: "Diagnostics failed to run" })
    }
  }

  const fetchRealtimeDashboard = async (force = false) => {
    console.log(`🔄 fetchRealtimeDashboard called - force: ${force}, user.id: ${user?.id}`)

    if (!user?.id) {
      console.warn("🚨 Cannot fetch dashboard - no user ID")
      return
    }

    try {
      console.log("📊 Setting loading state and clearing error...")
      setLoading(!force) // don't show loading spinner for force refresh
      setError(null)

      console.log("📡 Making API call...")
      // if force refresh, use refresh endpoint to clear cache
      const data = force
        ? await api.refreshRealtimeDashboard(user.id)
        : await api.getRealtimeDashboard(user.id)

      console.log("✅ API call successful, processing data...")
      setRealtimeData(data)
      setLastUpdated(new Date().toLocaleTimeString())

      // convert workflow data to dashboard summary format
      console.log("🔄 Converting workflow data to dashboard format...")
      const dashboardSummary = api.convertWorkflowsToDashboard(data)
      console.log("✅ Conversion complete, setting summary...")
      setSummary(dashboardSummary)

    } catch (err: any) {
      console.error('🚨 CRITICAL ERROR in fetchRealtimeDashboard:', err)
      console.error('🚨 Error details:')
      console.error('- Name:', err.name)
      console.error('- Message:', err.message)
      console.error('- Stack:', err.stack)

      const errorMessage = err.message || 'Unknown error occurred'
      setError(`Connection failed: ${errorMessage}`)

      console.log("🔄 Setting fallback error state...")
      // fallback to empty state with error alert
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
          message: `Unable to connect to backend: ${errorMessage}`,
          created_at: new Date().toISOString(),
        }],
        pipelines: [],
      })
    } finally {
      console.log("✅ Finally block - setting loading to false")
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    console.log("🔄 Manual refresh triggered")
    setRefreshing(true)
    await fetchRealtimeDashboard(true) // force refresh
    setRefreshing(false)
    console.log("✅ Manual refresh completed")
  }

  // Initial load effect
  useEffect(() => {
    console.log("🎬 Initial useEffect triggered")
    console.log("- isLoaded:", isLoaded)
    console.log("- user?.id:", user?.id)

    if (isLoaded && user?.id) {
      console.log("✅ Conditions met, fetching dashboard...")
      fetchRealtimeDashboard()
    } else {
      console.log("⏳ Waiting for user to load...")
    }
  }, [isLoaded, user?.id])

  // WebSocket setup effect
  useEffect(() => {
    console.log("🔌 Setting up websocket and polling...")
    // setup websocket and polling
    try {
      wsService.connect(
        (data) => {
          console.log('📡 websocket update received:', data)
          fetchRealtimeDashboard()
        },
        (error) => {
          console.log('🔌 websocket connection failed, using polling instead:', error)
        }
      )
    } catch (error) {
      console.log('🔌 websocket setup failed, using polling fallback:', error)
    }

    // polling fallback every 60 seconds
    const interval = setInterval(() => {
      console.log("⏰ Polling interval triggered")
      if (user?.id && !loading) {
        console.log("⏰ Polling - fetching updated data...")
        fetchRealtimeDashboard()
      }
    }, 60000)

    return () => {
      console.log("🧹 Cleaning up websocket and polling...")
      wsService.disconnect()
      clearInterval(interval)
    }
  }, [user?.id])

  // Show loading screen while user is loading
  if (!isLoaded) {
    console.log("⏳ Showing user loading screen...")
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading user information...</p>
        </div>
      </div>
    )
  }

  // Show login prompt if no user
  if (!user) {
    console.log("🚫 No user found, redirecting to sign in...")
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">Please sign in to view your dashboard.</p>
            <Link href="/sign-in">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main dashboard render
  console.log("🎨 Rendering main dashboard...")
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-serif">StreamCI Dashboard</h1>
            <Badge variant="outline" className="text-xs">
              {loading ? "Loading..." : error ? "Offline" : "Live"}
              {lastUpdated && ` • Updated ${lastUpdated}`}
            </Badge>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={runDiagnostics}
              className="text-xs"
            >
              <Zap className="w-3 h-3 mr-1" />
              Run Diagnostics
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <UserButton />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* DEBUG PANEL - REMOVE IN PRODUCTION */}
        <DebugPanel
          user={user}
          summary={summary}
          realtimeData={realtimeData}
          error={error}
          loading={loading}
          lastUpdated={lastUpdated}
          diagnostics={diagnostics}
        />

        {/* Connection Status Alert */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-900">Connection Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                  <p className="text-xs text-red-600 mt-1">
                    Check browser console for detailed debug information
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
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

        {/* Dashboard Content */}
        {summary && (
          <>
            {/* Overview Cards */}
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
                    Active Pipelines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl font-bold">
                      {summary.total_pipelines}
                    </div>
                    <GitBranch className="w-4 h-4 text-primary" />
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

            {/* Charts and Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DashboardChart />
              <LiveBuildStatus />
            </div>

            {/* Recent Activity & Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentActivity />
              {user?.id && <AnalyticsDashboard clerkUserId={user.id} />}
            </div>

            {/* Active Alerts */}
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
                          <Badge variant={alert.severity === 'error' ? 'destructive' : 'secondary'}>
                            {alert.severity}
                          </Badge>
                          <span className="text-sm">{alert.message}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Setup Link if no data */}
        {!loading && !error && (!summary || summary.total_pipelines === 0) && (
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <div>
                <h3 className="text-lg font-medium">Welcome to StreamCI!</h3>
                <p className="text-muted-foreground">
                  Get started by connecting your GitHub repositories
                </p>
              </div>
              <Link href="/setup">
                <Button>Setup GitHub Integration</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}