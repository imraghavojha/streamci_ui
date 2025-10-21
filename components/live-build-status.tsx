"use client"

import { useDashboardData } from '@/contexts/dashboard-polling-context'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function LiveBuildStatus() {
  const { realtimeData, loading } = useDashboardData()

  const runningWorkflows = (realtimeData?.workflows || []).filter(
    (w: any) => w.status === 'in_progress' || w.status === 'queued' || w.status === 'waiting'
  );

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="font-serif flex items-center space-x-2">
          <Activity className="w-5 h-5 text-primary" />
          <span>Live Build Status</span>
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {runningWorkflows && runningWorkflows.length > 0 ? (
          <div className="space-y-2">
            {runningWorkflows.slice(0, 5).map((workflow: any, index: number) => (
              <div key={workflow.id || index} className="flex justify-between items-center p-2 bg-muted/30 rounded-lg">
                <div className='truncate'>
                  <p className="truncate font-medium text-sm">{workflow.name}</p>
                  <p className="text-xs text-muted-foreground">{workflow.repository}</p>
                </div>
                <Badge variant={workflow.status === 'in_progress' ? 'default' : 'secondary'}>
                  {workflow.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : !loading ? (
          <p className="text-sm text-muted-foreground text-center py-4">No active builds</p>
        ) : (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
