import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Clock, CheckCircle, XCircle } from "lucide-react"

const builds = [
  { id: 1, status: "running", branch: "feature/auth", duration: "2m 15s", commit: "Fix login validation" },
  { id: 2, status: "queued", branch: "main", duration: "0s", commit: "Update dependencies" },
  { id: 3, status: "success", branch: "feature/ui", duration: "3m 42s", commit: "Improve dashboard layout" },
  { id: 4, status: "failed", branch: "hotfix/bug", duration: "1m 28s", commit: "Fix critical bug in payment" },
]

export function LiveBuildStatus() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
      case "queued":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
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
          <Activity className="w-5 h-5 text-primary" />
          <span>Live Build Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {builds.map((build) => (
            <div key={build.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(build.status)}
                <div>
                  <p className="font-medium text-sm">{build.branch}</p>
                  <p className="text-xs text-muted-foreground">{build.commit}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">{build.duration}</span>
                {getStatusBadge(build.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
