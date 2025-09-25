"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface AnalyticsDashboardProps {
    clerkUserId: string
}

export function AnalyticsDashboard({ clerkUserId }: AnalyticsDashboardProps) {
    const [trends, setTrends] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTrends = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/analytics/trends/${clerkUserId}`)
                const data = await response.json()
                setTrends(data)
            } catch (error) {
                console.error('failed to fetch trends:', error)
            } finally {
                setLoading(false)
            }
        }

        if (clerkUserId) {
            fetchTrends()
        }
    }, [clerkUserId])

    if (loading) return <div className="text-center py-4">loading analytics...</div>
    if (!trends) return <div className="text-center py-4">no analytics data available</div>

    const successRate = trends.success_rate_trends?.[0]?.success_rate || 0
    const stats = trends.build_stats || {}

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Success Rate Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Success Rate Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-green-600 mb-2">{successRate}%</div>
                        <Progress value={successRate} className="w-full h-3" />
                        <p className="text-sm text-muted-foreground mt-2">
                            overall build success rate
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{stats.successful_builds || 0}</div>
                            <div className="text-xs text-muted-foreground">successful builds</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{stats.failed_builds || 0}</div>
                            <div className="text-xs text-muted-foreground">failed builds</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Build Activity */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Build Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{stats.total_builds || 0}</div>
                            <div className="text-sm text-blue-800">total builds</div>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600">{stats.running_builds || 0}</div>
                            <div className="text-sm text-yellow-800">currently running</div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <div className="flex justify-between text-sm mb-2">
                            <span>Build Distribution</span>
                            <span>{stats.builds_analyzed || 0} analyzed</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-l-full"
                                style={{ width: `${successRate}%` }}
                            ></div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Trends */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Recent Success Trends</CardTitle>
                </CardHeader>
                <CardContent>
                    {trends.success_rate_trends && trends.success_rate_trends.length > 0 ? (
                        <div className="space-y-3">
                            {trends.success_rate_trends.slice(-5).map((trend: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                    <span className="font-medium">{trend.date}</span>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <div className="text-sm font-bold">{trend.success_rate}%</div>
                                            <div className="text-xs text-muted-foreground">
                                                {trend.successful_builds}/{trend.total_builds}
                                            </div>
                                        </div>
                                        <Badge
                                            variant={trend.success_rate >= 80 ? "default" : trend.success_rate >= 60 ? "secondary" : "destructive"}
                                            className="text-xs"
                                        >
                                            {trend.success_rate >= 80 ? "good" : trend.success_rate >= 60 ? "ok" : "poor"}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">no trend data available yet</p>
                    )}
                </CardContent>
            </Card>

            {/* Repository Health */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Repository Health</CardTitle>
                </CardHeader>
                <CardContent>
                    {trends.failure_patterns && trends.failure_patterns.length > 0 ? (
                        <div className="space-y-3">
                            {trends.failure_patterns.map((pattern: any, index: number) => (
                                <div key={index} className="p-3 border border-red-200 bg-red-50 rounded">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-red-800">{pattern.repository}</span>
                                        <Badge variant="destructive">{pattern.failure_rate}% fail rate</Badge>
                                    </div>
                                    <div className="text-sm text-red-600 mt-1">
                                        {pattern.failure_count} of {pattern.total_builds} builds failed
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-4xl mb-2">✅</div>
                            <p className="text-green-600 font-medium">all repositories healthy</p>
                            <p className="text-sm text-muted-foreground">no problematic patterns detected</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}