import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GitBranch, User } from "lucide-react"

const activities = [
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
]

export function RecentActivity() {
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
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{activity.message}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-muted-foreground">{activity.branch}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{activity.user}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                </div>
              </div>
              {getStatusBadge(activity.status)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
