"use client"

import { useUser, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { Loader2, RefreshCw, GitBranch } from "lucide-react"
import { DashboardChart } from "@/components/dashboard-chart"
import { LiveBuildStatus } from "@/components/live-build-status"
import { BuildHistory } from "@/components/build-history"
import { DashboardPollingProvider, useDashboardData } from '@/contexts/dashboard-polling-context'
import { RetroMenuBar } from "@/components/retro-menu-bar"
import { RetroFooter } from "@/components/retro-footer"

function DashboardContent() {
  const { user, isLoaded } = useUser()
  const {
    realtimeData,
    summary,
    loading,
    error,
    lastUpdated,
    refresh,
    isRefreshing
  } = useDashboardData()

  const handleRefresh = () => refresh(true)

  const selectedRepos = realtimeData?.selectedRepos || []

  if (!isLoaded || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <RetroMenuBar />

      {/* Desktop area with padding for menu/footer */}
      <div className="flex-grow pt-12 pb-12 px-4 w-full max-w-[1400px] mx-auto">
        {/* Header with user info */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">StreamCI Dashboard</h1>
            {lastUpdated && (
              <p className="text-sm opacity-75">Last updated: {lastUpdated}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/repositories">
              <button className="retro-btn flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                Manage Repos
              </button>
            </Link>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="retro-btn flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing || loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <UserButton />
          </div>
        </div>

        {/* Selected Repositories */}
        {selectedRepos.length > 0 && !loading && (
          <div className="retro-panel mb-6">
            <div className="panel-title-bar">
              <div className="panel-title">Monitoring {selectedRepos.length} {selectedRepos.length === 1 ? 'Repository' : 'Repositories'}</div>
            </div>
            <div className="panel-content">
              <div className="flex flex-wrap gap-2">
                {selectedRepos.map((repo) => (
                  <span
                    key={repo}
                    className="inline-block px-3 py-1 bg-[var(--subtle-bg)] border-2 border-[var(--border-color)] text-sm"
                  >
                    {repo}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No repos selected */}
        {selectedRepos.length === 0 && !loading && !error && (
          <div className="retro-panel mb-6 border-[var(--accent-color)]">
            <div className="panel-title-bar">
              <div className="panel-title">No Repositories</div>
            </div>
            <div className="panel-content">
              <div className="flex items-center gap-3">
                <GitBranch className="w-8 h-8" />
                <div className="flex-1">
                  <p className="font-bold mb-1">No repositories selected</p>
                  <p className="text-sm opacity-75">Select repositories to start monitoring your workflows</p>
                </div>
                <Link href="/repositories">
                  <button className="retro-btn retro-btn-primary">
                    Select Repositories
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Connection Error */}
        {error && !loading && (
          <div className="retro-panel mb-6 border-[var(--color-fail)]">
            <div className="panel-title-bar">
              <div className="panel-title">Connection Error</div>
            </div>
            <div className="panel-content">
              <p className="text-[var(--color-fail)]">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="retro-panel mb-6">
            <div className="panel-content">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <p>Loading dashboard data...</p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {summary && !loading && (
          <>
            {/* Overview Cards - Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Success Rate */}
              <div className="retro-panel">
                <div className="panel-title-bar">
                  <div className="panel-title">Success Rate</div>
                </div>
                <div className="panel-content">
                  <div className="text-5xl font-bold mb-1" style={{ color: 'var(--color-success)' }}>
                    {summary.overview.total_success_rate}%
                  </div>
                  <div className="text-lg">Last 24h</div>
                  <span className="text-sm" style={{ color: 'var(--color-success)' }}>(+2.1%)</span>
                </div>
              </div>

              {/* Total Builds */}
              <div className="retro-panel">
                <div className="panel-title-bar">
                  <div className="panel-title">Total Builds</div>
                </div>
                <div className="panel-content">
                  <div className="text-5xl font-bold mb-1" style={{ color: 'var(--accent-color)' }}>
                    {summary.overview.total_builds}
                  </div>
                  <div className="text-lg">All Time</div>
                </div>
              </div>

              {/* Builds Today */}
              <div className="retro-panel">
                <div className="panel-title-bar">
                  <div className="panel-title">Builds Today</div>
                </div>
                <div className="panel-content">
                  <div className="text-5xl font-bold mb-1" style={{ color: 'var(--color-run)' }}>
                    {summary.recent_activity.builds_last_24h}
                  </div>
                  <div className="text-lg">Last 24 Hours</div>
                </div>
              </div>

              {/* Active Alerts */}
              <div className="retro-panel">
                <div className="panel-title-bar">
                  <div className="panel-title">Active Alerts</div>
                </div>
                <div className="panel-content">
                  <div className="text-5xl font-bold mb-1" style={{ color: 'var(--color-fail)' }}>
                    {summary.active_alerts.length}
                  </div>
                  <div className="text-lg">Critical Issues</div>
                </div>
              </div>
            </div>

            {/* Charts and Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="retro-panel">
                <div className="panel-title-bar">
                  <div className="panel-title">Build Trends</div>
                </div>
                <div className="panel-content">
                  <DashboardChart />
                </div>
              </div>

              <div className="retro-panel">
                <div className="panel-title-bar">
                  <div className="panel-title">Live Build Status</div>
                </div>
                <div className="panel-content">
                  <LiveBuildStatus />
                </div>
              </div>
            </div>

            {/* Build History - Full Width */}
            <div className="retro-panel mb-6">
              <div className="panel-title-bar">
                <div className="panel-title">Build History</div>
              </div>
              <div className="panel-content">
                <BuildHistory workflows={realtimeData?.workflows || []} />
              </div>
            </div>

            {/* Analytics */}
            {user?.id && (
              <div className="retro-panel mb-6">
                <div className="panel-title-bar">
                  <div className="panel-title">Analytics Dashboard</div>
                </div>
                <div className="panel-content">
                  <AnalyticsDashboard clerkUserId={user.id} />
                </div>
              </div>
            )}

            {/* Active Alerts */}
            {summary.active_alerts.length > 0 && (
              <div className="retro-panel">
                <div className="panel-title-bar">
                  <div className="panel-title">Active Alerts</div>
                </div>
                <div className="panel-content">
                  <div className="space-y-2">
                    {summary.active_alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="flex items-center justify-between p-3 border-2 border-[var(--border-color)] bg-[var(--subtle-bg)]"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="px-2 py-1 border-2 border-[var(--border-color)] text-sm font-bold"
                            style={{
                              backgroundColor: alert.severity === 'error' ? 'var(--color-fail)' : 'var(--color-warn)',
                              color: 'white'
                            }}
                          >
                            {alert.severity.toUpperCase()}
                          </span>
                          <div>
                            <p className="font-bold">{alert.message}</p>
                            <p className="text-sm opacity-75">
                              {new Date(alert.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <RetroFooter />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <DashboardPollingProvider>
      <DashboardContent />
    </DashboardPollingProvider>
  )
}
