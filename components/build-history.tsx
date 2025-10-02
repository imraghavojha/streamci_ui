"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GitBranch, Clock, CheckCircle, XCircle, Loader2, GitCommit } from "lucide-react"

interface Workflow {
    id: number
    name: string
    status: string
    conclusion: string | null
    created_at: string
    repository: string
    head_branch?: string
    head_sha?: string
}

interface BuildHistoryProps {
    workflows: Workflow[]
}

export function BuildHistory({ workflows }: BuildHistoryProps) {
    const getStatusIcon = (status: string, conclusion: string | null) => {
        if (status === "in_progress" || status === "queued") {
            return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
        }

        if (conclusion === "success") {
            return <CheckCircle className="w-4 h-4 text-green-500" />
        }

        if (conclusion === "failure") {
            return <XCircle className="w-4 h-4 text-red-500" />
        }

        return <Clock className="w-4 h-4 text-gray-500" />
    }

    const getStatusBadge = (status: string, conclusion: string | null) => {
        if (status === "in_progress") {
            return <Badge className="bg-blue-500/10 text-blue-500">Running</Badge>
        }

        if (status === "queued") {
            return <Badge className="bg-yellow-500/10 text-yellow-500">Queued</Badge>
        }

        if (conclusion === "success") {
            return <Badge className="bg-green-500/10 text-green-500">Success</Badge>
        }

        if (conclusion === "failure") {
            return <Badge className="bg-red-500/10 text-red-500">Failed</Badge>
        }

        if (conclusion === "cancelled") {
            return <Badge className="bg-gray-500/10 text-gray-500">Cancelled</Badge>
        }

        return <Badge variant="secondary">{status}</Badge>
    }

    const formatTime = (timestamp: string) => {
        try {
            const date = new Date(timestamp)
            const now = new Date()
            const diffMs = now.getTime() - date.getTime()
            const diffMins = Math.floor(diffMs / 60000)
            const diffHours = Math.floor(diffMs / 3600000)
            const diffDays = Math.floor(diffMs / 86400000)

            if (diffMins < 1) return "just now"
            if (diffMins < 60) return `${diffMins}m ago`
            if (diffHours < 24) return `${diffHours}h ago`
            if (diffDays < 7) return `${diffDays}d ago`

            return date.toLocaleDateString()
        } catch {
            return timestamp
        }
    }

    const sortedWorkflows = [...workflows].sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return (
        <Card className="border-border">
            <CardHeader>
                <CardTitle className="font-serif flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <GitBranch className="w-5 h-5 text-primary" />
                        <span>Build History</span>
                    </div>
                    <Badge variant="outline">{workflows.length} total</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {workflows.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <GitBranch className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No builds yet</p>
                        <p className="text-sm">Builds will appear here once workflows run</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                        {sortedWorkflows.map((workflow) => (
                            <div
                                key={workflow.id}
                                className="flex items-start justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-start space-x-3 flex-1">
                                    {getStatusIcon(workflow.status, workflow.conclusion)}

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-medium truncate">{workflow.name}</p>
                                            {getStatusBadge(workflow.status, workflow.conclusion)}
                                        </div>

                                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                                            <div className="flex items-center gap-1">
                                                <GitBranch className="w-3 h-3" />
                                                <span>{workflow.head_branch || "main"}</span>
                                            </div>

                                            {workflow.head_sha && (
                                                <div className="flex items-center gap-1">
                                                    <GitCommit className="w-3 h-3" />
                                                    <span className="font-mono">{workflow.head_sha.substring(0, 7)}</span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                <span>{formatTime(workflow.created_at)}</span>
                                            </div>
                                        </div>

                                        <p className="text-xs text-muted-foreground mt-1">
                                            {workflow.repository}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}