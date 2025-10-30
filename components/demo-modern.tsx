"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Play, CheckCircle, XCircle, Clock, AlertTriangle,
  BarChart3, TrendingUp, Zap, GitBranch, ArrowLeft, Bell,
  Activity, Terminal, ChevronRight
} from "lucide-react"
import Link from "next/link"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface WorkflowStep {
  name: string
  status: "pending" | "running" | "success" | "failed"
  duration: number
  startTime?: Date
}

interface Alert {
  id: string
  type: "warning" | "error" | "success" | "info"
  message: string
  timestamp: Date
  icon: string
}

interface LogEntry {
  id: string
  text: string
  type: "info" | "success" | "error" | "warning"
}

interface MetricDataPoint {
  time: string
  value: number
}

export function DemoModern() {
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const logsEndRef = useRef<HTMLDivElement>(null)

  const [successRateData, setSuccessRateData] = useState<MetricDataPoint[]>([
    { time: '0s', value: 94 },
  ])
  const [buildTimeData, setBuildTimeData] = useState<MetricDataPoint[]>([
    { time: '0s', value: 4.3 },
  ])
  const [queueData, setQueueData] = useState<MetricDataPoint[]>([
    { time: '0s', value: 12 },
  ])
  const [runnersData, setRunnersData] = useState<MetricDataPoint[]>([
    { time: '0s', value: 8 },
  ])

  // Heatmap data - simulated build history (client-side only to avoid hydration issues)
  const [heatmapData, setHeatmapData] = useState<any[]>([])

  useEffect(() => {
    const weeks = 12
    const daysPerWeek = 7
    const data = []
    for (let week = 0; week < weeks; week++) {
      for (let day = 0; day < daysPerWeek; day++) {
        // Use week/day as seed for consistent results
        const seed = (week * 7 + day) * 0.1
        const random = (Math.sin(seed) + 1) / 2
        data.push({
          week,
          day,
          status: random > 0.15 ? 'success' : random > 0.05 ? 'failed' : 'pending',
          builds: Math.floor(random * 8) + 1
        })
      }
    }
    setHeatmapData(data)
  }, [])

  const [steps, setSteps] = useState<WorkflowStep[]>([
    { name: "Initialize Environment", status: "pending", duration: 0 },
    { name: "Checkout Code", status: "pending", duration: 0 },
    { name: "Install Dependencies", status: "pending", duration: 0 },
    { name: "Run Linter", status: "pending", duration: 0 },
    { name: "Run Tests", status: "pending", duration: 0 },
    { name: "Build Application", status: "pending", duration: 0 },
    { name: "Run Security Scan", status: "pending", duration: 0 },
    { name: "Deploy to Staging", status: "pending", duration: 0 }
  ])

  const addLog = (text: string, type: LogEntry["type"] = "info") => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      type
    }
    setLogs(prev => [...prev, newLog])
  }

  const addAlert = (type: Alert["type"], message: string, icon: string) => {
    const newAlert: Alert = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      icon,
      timestamp: new Date()
    }
    setAlerts(prev => [newAlert, ...prev].slice(0, 8))
  }

  const updateMetric = (
    setter: React.Dispatch<React.SetStateAction<MetricDataPoint[]>>,
    newValue: number,
    timeLabel: string
  ) => {
    setter(prev => {
      const updated = [...prev, { time: timeLabel, value: newValue }]
      return updated.slice(-10) // Keep last 10 points
    })
  }

  useEffect(() => {
    if (logs.length > 0 && logsEndRef.current) {
      // Only scroll within the terminal container, not the whole page
      const container = logsEndRef.current.parentElement
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    }
  }, [logs])

  const runWorkflow = async () => {
    if (isRunning) return

    setIsRunning(true)
    setCurrentStep(0)
    setAlerts([])
    setLogs([])

    // Reset metrics
    setSuccessRateData([{ time: '0s', value: 94 }])
    setBuildTimeData([{ time: '0s', value: 4.3 }])
    setQueueData([{ time: '0s', value: 12 }])
    setRunnersData([{ time: '0s', value: 8 }])

    // Reset steps
    setSteps(prev => prev.map(step => ({ ...step, status: "pending", duration: 0 })))

    addLog("🚀 Workflow started for demo-user/awesome-app", "info")
    addLog("📦 Connecting to runner pool...", "info")
    addAlert("info", "Workflow triggered: demo-user/awesome-app on branch main", "🚀")

    await new Promise(resolve => setTimeout(resolve, 800))

    // Run workflow
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i)
      const stepName = steps[i].name

      // Mark as running
      setSteps(prev => prev.map((step, idx) =>
        idx === i ? { ...step, status: "running", startTime: new Date() } : step
      ))

      addLog(`⚡ Starting: ${stepName}...`, "info")

      // Simulate duration
      const duration = Math.random() * 3000 + 1500
      const startTime = Date.now()

      // Add step-specific logs
      await new Promise(resolve => setTimeout(resolve, 400))

      if (i === 0) {
        addLog("🔧 Setting up Node.js 18.x", "info")
        addLog("✓ Node.js environment ready", "success")
      } else if (i === 1) {
        addLog("📥 Fetching repository from GitHub", "info")
        addLog("✓ Code checked out successfully", "success")
      } else if (i === 2) {
        addLog("📚 Running npm install...", "info")
        await new Promise(resolve => setTimeout(resolve, 600))
        addLog("✓ Dependencies installed (287 packages)", "success")
        if (Math.random() > 0.4) {
          addAlert("warning", "Memory usage high on runner-2 (85%)", "⚠️")
          addLog("⚠️  Warning: High memory usage detected", "warning")
        }
      } else if (i === 3) {
        addLog("🔍 Running ESLint...", "info")
        addLog("✓ No linting errors found", "success")
      } else if (i === 4) {
        addLog("🧪 Running test suite...", "info")
        await new Promise(resolve => setTimeout(resolve, 500))
        if (Math.random() < 0.15) {
          addLog("❌ Test suite failed: 2 tests failing in auth.test.ts", "error")
          addAlert("error", "Tests failed: 2 tests failing in auth.test.ts", "❌")
          setSteps(prev => prev.map((step, idx) =>
            idx === i ? { ...step, status: "failed", duration: (Date.now() - startTime) / 1000 } : step
          ))
          setIsRunning(false)
          return
        }
        addLog("✓ All tests passed (42 tests, 156 assertions)", "success")
        if (Math.random() > 0.5) {
          addAlert("warning", "Test suite taking longer than usual (+18%)", "⏱️")
        }
      } else if (i === 5) {
        addLog("🏗️  Building production bundle...", "info")
        await new Promise(resolve => setTimeout(resolve, 700))
        addLog("✓ Build completed successfully (3.2 MB)", "success")
        if (Math.random() > 0.4) {
          addAlert("warning", "Build queue will be backed up in 18 minutes", "⏱️")
          updateMetric(setQueueData, 18, `${i * 3}s`)
        }
      } else if (i === 6) {
        addLog("🔒 Running security scan...", "info")
        await new Promise(resolve => setTimeout(resolve, 500))
        if (Math.random() > 0.6) {
          addLog("⚠️  Found 2 moderate severity vulnerabilities", "warning")
          addAlert("warning", "2 security vulnerabilities detected in dependencies", "🔒")
        } else {
          addLog("✓ No vulnerabilities found", "success")
        }
      } else if (i === 7) {
        addLog("🚀 Deploying to staging environment...", "info")
        await new Promise(resolve => setTimeout(resolve, 600))
        addLog("✓ Deployment successful", "success")
      }

      await new Promise(resolve => setTimeout(resolve, duration - 1000))

      // Mark as success
      const finalDuration = (Date.now() - startTime) / 1000
      setSteps(prev => prev.map((step, idx) =>
        idx === i ? { ...step, status: "success", duration: finalDuration } : step
      ))

      addLog(`✅ Completed: ${stepName} (${finalDuration.toFixed(1)}s)`, "success")
      addAlert("success", `${stepName} completed in ${finalDuration.toFixed(1)}s`, "✅")

      // Update metrics periodically
      if (i % 2 === 0) {
        updateMetric(setSuccessRateData, 94 + Math.random() * 4, `${i * 3}s`)
        updateMetric(setBuildTimeData, 4.3 + (Math.random() - 0.5), `${i * 3}s`)
        updateMetric(setQueueData, 12 + Math.floor(Math.random() * 8), `${i * 3}s`)
        updateMetric(setRunnersData, 8 + Math.floor(Math.random() * 3), `${i * 3}s`)
      }
    }

    // Completion
    addLog("", "info")
    addLog("🎉 Workflow completed successfully!", "success")
    addLog("📊 Total duration: 28.4s (12% faster than average)", "success")
    addAlert("success", "Workflow completed successfully!", "🎉")
    addAlert("info", "Build took 28.4s (12% faster than average)", "📊")

    setIsRunning(false)
  }

  const getStepIcon = (status: WorkflowStep["status"]) => {
    switch (status) {
      case "running":
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getAlertStyles = (type: Alert["type"]) => {
    switch (type) {
      case "error":
        return "bg-red-500/10 border-red-500/50 text-red-500"
      case "warning":
        return "bg-yellow-500/10 border-yellow-500/50 text-yellow-500"
      case "success":
        return "bg-green-500/10 border-green-500/50 text-green-500"
      default:
        return "bg-blue-500/10 border-blue-500/50 text-blue-500"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xl font-serif font-bold">StreamCI</span>
                <Badge variant="secondary" className="ml-2 text-xs">DEMO</Badge>
              </div>
            </div>
          </div>

          <Button
            onClick={runWorkflow}
            disabled={isRunning}
            size="lg"
            className="flex items-center space-x-2"
          >
            {isRunning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span className="hidden sm:inline">Running...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span className="hidden sm:inline">Run Demo Workflow</span>
                <span className="sm:hidden">Run Demo</span>
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Section 1: Hero */}
      <section className="py-12 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Live CI/CD Pipeline Simulation
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Watch StreamCI analyze a GitHub Actions workflow in real-time with predictive alerts and intelligent insights.
          </p>

          {/* Repository Card */}
          <Card className="border-border max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <GitBranch className="w-5 h-5 text-primary" />
                  <div className="text-left">
                    <CardTitle className="text-lg">demo-user/awesome-app</CardTitle>
                    <p className="text-sm text-muted-foreground">Branch: main • Commit: a3f2b1c • "Add new feature"</p>
                  </div>
                </div>
                <Badge variant={isRunning ? "default" : "secondary"} className="hidden sm:flex">
                  {isRunning ? "Running" : "Ready"}
                </Badge>
              </div>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Section 2: Live Pipeline + Terminal */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-2">Live Pipeline Execution</h2>
            <p className="text-muted-foreground">Watch each step execute in real-time</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Pipeline Flow */}
            <div className="lg:col-span-2">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Workflow Steps</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {steps.map((step, idx) => (
                    <div
                      key={idx}
                      className={`relative flex items-center justify-between p-4 rounded-lg border transition-all ${step.status === "running"
                          ? "bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/20"
                          : step.status === "success"
                            ? "bg-green-500/5 border-green-500/20"
                            : step.status === "failed"
                              ? "bg-red-500/10 border-red-500/50"
                              : "bg-muted/30 border-border"
                        }`}
                    >
                      {step.status === "running" && (
                        <div className="absolute inset-0 bg-blue-500/5 animate-pulse rounded-lg" />
                      )}
                      <div className="flex items-center space-x-3 relative z-10">
                        <div className="flex-shrink-0">
                          {getStepIcon(step.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{step.name}</p>
                          {step.duration > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {step.duration.toFixed(1)}s
                            </p>
                          )}
                        </div>
                      </div>
                      {step.status === "running" && (
                        <div className="w-20 sm:w-24 relative z-10">
                          <Progress value={Math.random() * 100} className="h-1" />
                        </div>
                      )}
                      {idx < steps.length - 1 && (
                        <div className={`absolute left-[18px] top-full w-0.5 h-2 ${idx < currentStep ? 'bg-green-500' : 'bg-border'
                          }`} />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Terminal Logs */}
            <div className="lg:col-span-1">
              <Card className="border-border h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <Terminal className="w-4 h-4" />
                    <span>Console Output</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-black/90 rounded-lg p-3 h-[400px] lg:h-[600px] overflow-y-auto font-mono text-xs">
                    {logs.length === 0 ? (
                      <div className="text-gray-500 text-center py-8">
                        <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">Waiting for workflow...</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {logs.map(log => (
                          <div
                            key={log.id}
                            className={`${log.type === 'error' ? 'text-red-400' :
                                log.type === 'success' ? 'text-green-400' :
                                  log.type === 'warning' ? 'text-yellow-400' :
                                    'text-gray-300'
                              }`}
                          >
                            {log.text}
                          </div>
                        ))}
                        <div ref={logsEndRef} />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Real-Time Metrics */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-2">Real-Time Analytics</h2>
            <p className="text-muted-foreground">Performance metrics updating live</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Success Rate */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Success Rate</span>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-4">
                  {successRateData[successRateData.length - 1]?.value.toFixed(1)}%
                </div>
                <ResponsiveContainer width="100%" height={100}>
                  <LineChart data={successRateData}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Build Time */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Avg Build Time</span>
                  <Clock className="w-4 h-4 text-blue-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-4">
                  {buildTimeData[buildTimeData.length - 1]?.value.toFixed(1)}m
                </div>
                <ResponsiveContainer width="100%" height={100}>
                  <LineChart data={buildTimeData}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Queue Length */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Queue Length</span>
                  <Activity className="w-4 h-4 text-yellow-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600 mb-4">
                  {queueData[queueData.length - 1]?.value}
                </div>
                <ResponsiveContainer width="100%" height={100}>
                  <LineChart data={queueData}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#eab308"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Active Runners */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Active Runners</span>
                  <Zap className="w-4 h-4 text-purple-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-4">
                  {runnersData[runnersData.length - 1]?.value}
                </div>
                <ResponsiveContainer width="100%" height={100}>
                  <LineChart data={runnersData}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#a855f7"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 4: Predictive Alerts */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-2">Predictive Alerts</h2>
            <p className="text-muted-foreground">Early warnings before problems impact your team</p>
          </div>

          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Alert Feed</span>
                </CardTitle>
                <Badge variant="outline">{alerts.length} active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Zap className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-base mb-2">No alerts yet</p>
                  <p className="text-sm">Run the workflow to see intelligent insights</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {alerts.map(alert => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border ${getAlertStyles(alert.type)} transition-all hover:scale-[1.02]`}
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl flex-shrink-0">{alert.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium mb-1">{alert.message}</p>
                          <p className="text-xs opacity-70">
                            {alert.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section 5: Historical Performance */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-2">Build History Heatmap</h2>
            <p className="text-muted-foreground">Pattern recognition across 12 weeks</p>
          </div>

          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <div className="inline-grid grid-rows-7 gap-1 min-w-max">
                  {[0, 1, 2, 3, 4, 5, 6].map(day => (
                    <div key={day} className="flex gap-1">
                      {Array.from({ length: 12 }).map((_, week) => {
                        const cell = heatmapData.find(d => d.week === week && d.day === day)
                        return (
                          <div
                            key={week}
                            className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm transition-all hover:scale-125 cursor-pointer ${cell?.status === 'success'
                                ? 'bg-green-500/80 hover:bg-green-500'
                                : cell?.status === 'failed'
                                  ? 'bg-red-500/80 hover:bg-red-500'
                                  : 'bg-muted'
                              }`}
                            title={`Week ${week + 1}, ${cell?.builds || 0} builds`}
                          />
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between mt-6 text-xs text-muted-foreground">
                <span>12 weeks ago</span>
                <div className="flex items-center space-x-2">
                  <span>Less</span>
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-muted rounded-sm" />
                    <div className="w-3 h-3 bg-green-500/40 rounded-sm" />
                    <div className="w-3 h-3 bg-green-500/60 rounded-sm" />
                    <div className="w-3 h-3 bg-green-500/80 rounded-sm" />
                    <div className="w-3 h-3 bg-green-500 rounded-sm" />
                  </div>
                  <span>More</span>
                </div>
                <span>Today</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section 6: Before vs After */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-2">Traditional vs StreamCI Approach</h2>
            <p className="text-muted-foreground">Different ways to monitor CI/CD pipelines</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Before */}
            <Card className="border-red-500/30 bg-red-500/5">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-600">
                  <XCircle className="w-5 h-5" />
                  <span>Traditional Monitoring</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                    <p className="text-sm text-muted-foreground">
                      Alerts after failures occur
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                    <p className="text-sm text-muted-foreground">
                      Limited visibility into patterns
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                    <p className="text-sm text-muted-foreground">
                      Reactive approach to issues
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                    <p className="text-sm text-muted-foreground">
                      Manual correlation across builds
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                    <p className="text-sm text-muted-foreground">
                      Basic metrics only
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* After */}
            <Card className="border-green-500/30 bg-green-500/5">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span>StreamCI Approach</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                    <p className="text-sm text-muted-foreground">
                      Early warning system for potential issues
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                    <p className="text-sm text-muted-foreground">
                      Pattern detection across workflows
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                    <p className="text-sm text-muted-foreground">
                      Proactive monitoring approach
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                    <p className="text-sm text-muted-foreground">
                      Automated trend analysis
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                    <p className="text-sm text-muted-foreground">
                      Real-time analytics and insights
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 7: What You Just Saw */}
      <section className="py-16 px-4 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
            What You Just Witnessed
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Key features of StreamCI in action
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            <Card className="border-border">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-6 h-6 text-blue-500" />
                </div>
                <div className="text-2xl font-bold mb-2">Early Alerts</div>
                <p className="text-sm text-muted-foreground">Warning system for potential issues</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
                <div className="text-2xl font-bold mb-2">Real-time</div>
                <p className="text-sm text-muted-foreground">Live pattern recognition</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-purple-500" />
                </div>
                <div className="text-2xl font-bold mb-2">Automated</div>
                <p className="text-sm text-muted-foreground">Continuous monitoring</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary/50 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
            <CardContent className="py-8">
              <h3 className="text-2xl font-serif font-bold mb-4">
                Ready to monitor your CI/CD pipelines?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Get real-time insights and analytics for your GitHub Actions workflows
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/sign-up">
                  <Button size="lg" className="flex items-center space-x-2">
                    <span>Get Started</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" size="lg">
                    Learn More
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}