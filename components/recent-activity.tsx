"use client"

import { useDashboardData } from '@/contexts/dashboard-polling-context'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GitBranch, Loader2 } from "lucide-react"

export function RecentActivity() {
  const { summary, loading } = useDashboardData()

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="font-serif flex items-center space-x-2">
          <GitBranch className="w-5 h-5 text-primary" />
          <span>Recent Activity</span>
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {summary?.recent_activity ? (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Builds (24h):</span>
              <span className="font-bold">{summary.recent_activity.builds_last_24h}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Successful:</span>
              <span>{summary.recent_activity.successful_builds_last_24h}</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Failed:</span>
              <span>{summary.recent_activity.failed_builds_last_24h}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No activity data</p>
        )}
      </CardContent>
    </Card>
  )
}
