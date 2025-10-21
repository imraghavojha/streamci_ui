"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

interface LiveBuild {
  id: number | string
  status: string
  branch?: string
  commit: string
  duration: string
  pipeline_name?: string
  repository?: string
  name?: string
}

export function LiveBuildStatus() {
  const { user } = useUser()
  const [builds, setBuilds] = useState<LiveBuild[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLiveBuilds = async () => {
    if (!user?.id) return

    try {
      setLoading(true)

      // Fetch from realtime dashboard to get actual running workflows
      const realtimeData = await api.getRealtimeDashboard(user.id)

      // Filter only in_progress and queued workflows
      const runningWorkflows = (realtimeData.workflows || [])
        .filter((w: any) =>
          w.status === 'in_progress' ||
          w.status === 'queued' ||
          w.status === 'waiting'
        )
        .map((w: any, index: number) => ({
          id: w.id || index,
          status: w.status,
          branch: w.head_branch || w.branch || 'main',  // FIX: Use head_branch from GitHub API
          commit: w.name || 'Workflow',
          duration: calculateDuration(w.created_at),
          pipeline_name: w.name,
          repository: w.repository
        }))

      setBuilds(runningWorkflows)
      setError(null)
    } catch (err) {
      console.error('failed to fetch live builds:', err)
      setError('failed to load live builds')
      setBuilds([])
    } finally {
      setLoading(false)
    }
  }

  const calculateDuration = (createdAt: string): string => {
    if (!createdAt) return '0s'
    const start = new Date(createdAt)
    const now = new Date()
    const diffSeconds = Math.floor((now.getTime() - start.getTime()) / 1000)

    if (diffSeconds < 60) return `${diffSeconds}s`
    const minutes = Math.floor(diffSeconds / 60)
    const seconds = diffSeconds % 60
    return `${minutes}m ${seconds}s`
  }

  useEffect(() => {
    if (user?.id) {
      fetchLiveBuilds()

      // refresh every 10 seconds for live updates
      const interval = setInterval(fetchLiveBuilds, 10 * 1000)
      return () => clearInterval(interval)
    }
  }, [user?.id])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in_progress":
        return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
      case "queued":
      case "waiting":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "success":
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "failed":
      case "failure":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress":
        return (
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
            Running
          </Badge>
        )
      case "queued":
      case "waiting":
        return (
          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">
            Queued
          </Badge>
        )
      case "success":
      case "completed":
        return (
          <Badge variant="secondary" className="bg-green-500/10 text-green-500">
            Success
          </Badge>
        )
      case "failed":
      case "failure":
        return (
          <Badge variant="secondary" className="bg-red-500/10 text-red-500">
            Failed
          </Badge>
        )
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="font-serif flex items-center space-x-2">
          <Activity className="w-5 h-5 text-primary" />
          <span>Live Build Status</span>
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        </CardTitle>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {builds.length === 0 && !loading ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No active builds
            </p>
          ) : (
            builds.map((build) => (
              <div key={build.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(build.status)}
                  <div>
                    <p className="font-medium text-sm">{build.branch}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {build.commit}
                    </p>
                    {build.repository && (
                      <p className="text-xs text-muted-foreground">
                        {build.repository}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">{build.duration}</span>
                  {getStatusBadge(build.status)}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}