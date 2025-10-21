"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { TrendingUp, Loader2 } from "lucide-react"
import { api, TrendData } from "@/lib/api"

const chartConfig = {
  successRate: {
    label: "Success Rate",
    color: "hsl(var(--primary))",
  },
} satisfies Record<string, { label: string; color: string }>

export function DashboardChart() {
  const { user } = useUser()
  const [data, setData] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTrendData = async () => {
    try {
      setLoading(true)

      if (!user?.id) {
        setError('No user logged in')
        setData([])
        return
      }

      const trendsResponse = await api.getTrends(user.id)

      // extract the actual trend data from the response
      const trendData = ((trendsResponse.success_rate_trends || []) as any[]).map((trend: any) => ({
        date: trend.date || 'N/A',
        successRate: trend.success_rate || 0
      }))

      setData(trendData)
      setError(null)
    } catch (err) {
      console.error('failed to fetch trend data:', err)
      setError('failed to load chart data')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  // critical: chart needs its own initial fetch, no polling
  useEffect(() => {
    if (user?.id) {
      fetchTrendData()
    }
    // no interval - removed polling!
  }, [user?.id])

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="font-serif flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span>Success Rate Trend</span>
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        </CardTitle>
        <CardDescription>
          Last 7 days pipeline success rate
          {error && <span className="text-red-500 ml-2">({error})</span>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 10)}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  domain={[0, 100]}
                />
                <ChartTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border border-border rounded-lg p-2 shadow-lg">
                          <p className="text-sm font-medium">{`${label}`}</p>
                          <p className="text-sm text-primary">{`Success Rate: ${payload[0].value}%`}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="successRate"
                  stroke={"hsl(var(--primary))"}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            {loading ? 'Loading chart data...' : 'No trend data available'}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
