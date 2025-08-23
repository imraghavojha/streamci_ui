"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { TrendingUp } from "lucide-react"

const data = [
  { date: "Jan 1", successRate: 92 },
  { date: "Jan 2", successRate: 94 },
  { date: "Jan 3", successRate: 89 },
  { date: "Jan 4", successRate: 96 },
  { date: "Jan 5", successRate: 93 },
  { date: "Jan 6", successRate: 97 },
  { date: "Jan 7", successRate: 94 },
]

const chartConfig = {
  successRate: {
    label: "Success Rate",
    color: "hsl(var(--primary))",
  },
} satisfies Record<string, { label: string; color: string }>

export function DashboardChart() {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="font-serif flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span>Success Rate Trend</span>
        </CardTitle>
        <CardDescription>Last 7 days pipeline success rate</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} domain={[80, 100]} />
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
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
