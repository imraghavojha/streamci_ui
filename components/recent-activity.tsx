"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GitBranch, User, Loader2 } from "lucide-react"
import { api, DashboardSummary } from "@/lib/api"

interface ActivityItem {
  id: number
  type: string
  status: string
  message: string
  branch: string
  user: string
  time: string
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<DashboardSummary | null>(null)

  const fetchRecentActivity = async () => {
    try {
      setLoading(true)
      const dashboardSummary = await api.getDashboardSummary()
      setSummary(dashboardSummary)

      // transform recent activity data to component format
      const recentData = dashboardSummary.recent_activity
      const mockActivities: ActivityItem[] = [
        {
          id: 1,
          type: "build",
          status: recentData.successful_builds_last_24h > recentData.failed_builds_last_24h ? "success" : "failed",
          message: `${recentData.builds_last_24h} builds completed in last 24h`,
          branch: "main",
          user: "system",
          time: "last 24 hours",
        },
        {
          id: 2,
          type: "build",
          status: "success",
          message: `${recentData.successful_builds_last_24h} successful builds`,
          branch: "various",
          user: "team",
          time: "last 24 hours",
        }
      ]

      // add failed builds if any
      if (recentData.failed_builds_last_24h > 0) {
        mockActivities.push({
          id: 3,
          type: "build",
          status: "failed",
          message: `${recentData.failed_builds_last_24h} failed builds`,
          branch: "various",
          user: "team",
          time: "last 24 hours",
        })
      }

      setActivities(mockActivities)
      setError(null)
    } catch (err) {
      console.error('failed to fetch recent activity:', err)
      setError('failed to load activity')
      // fallback to mock data
      setActivities([
        {
          id: 1,
          type: "build",
          status: "success",
          message: "Build completed successfully",
          branch: "main",
          user: "john.doe",
          time: "2 minutes ago",
        },
        {
          id: 2,
          type: "build",
          status: "failed",
          message: "Build failed - test errors",
          branch: "feature/auth",
          user: "jane.smith",
          time: "5 minutes ago",
        },
        {
          id: 3,
          type: "build",
          status: "success",
          message: "Build completed successfully",
          branch: "hotfix/critical",
          user: "mike.wilson",
          time: "12 minutes ago",
        },
        {
          id: 4,
          type: "build",
          status: "success",
          message: "Build completed successfully",
          branch: "feature/ui-update",
          user: "sarah.chen",
          time: "18 minutes ago",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecentActivity()

    // refresh every 2 minutes
    const interval = setInterval(fetchRecentActivity, 2 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="secondary" className="bg-green-500/10 text-green-500">
            Success
          </Badge>
        )
      case "failed":
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
          <GitBranch className="w-5 h-5 text-primary" />
          <span>Recent Activity</span>
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        </CardTitle>
        {summary && (
          <p className="text-sm text-muted-foreground">
            {summary.recent_activity.builds_last_24h} builds in last 24h
          </p>
        )}
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-start space-x-3">
                <User className="w-4 h-4 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.message}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <GitBranch className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{activity.branch}</span>
                    <span className="text-xs text-muted-foreground">by {activity.user}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
              <div className="flex items-start">
                {getStatusBadge(activity.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}