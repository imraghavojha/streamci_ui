"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { api, LiveBuild } from "@/lib/api"

export function LiveBuildStatus() {
  const [builds, setBuilds] = useState<LiveBuild[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLiveBuilds = async () => {
    try {
      setLoading(true)
      const liveBuilds = await api.getLiveBuilds()
      setBuilds(liveBuilds)
      setError(null)
    } catch (err) {
      console.error('failed to fetch live builds:', err)
      setError('failed to load live builds')
      // fallback to mock data
      setBuilds([
        { id: 1, status: "running", branch: "feature/auth", duration: "2m 15s", commit: "Fix login validation" },
        { id: 2, status: "queued", branch: "main", duration: "0s", commit: "Update dependencies" },
        { id: 3, status: "success", branch: "feature/ui", duration: "3m 42s", commit: "Improve dashboard layout" },
        { id: 4, status: "failed", branch: "hotfix/bug", duration: "1m 28s", commit: "Fix critical bug in payment" },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLiveBuilds()

    // refresh every 30 seconds for live updates
    const interval = setInterval(fetchLiveBuilds, 30 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
      case "in_progress":
        return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
      case "queued":
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
      case "running":
      case "in_progress":
        return (
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
            Running
          </Badge>
        )
      case "queued":
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
                    {build.pipeline_name && (
                      <p className="text-xs text-muted-foreground">
                        {build.pipeline_name}
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