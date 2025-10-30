"use client"

import { useState, useEffect, useRef } from "react"
import { Progress } from "@/components/ui/progress"
import {
  Play, CheckCircle, XCircle, Clock, AlertTriangle,
  BarChart3, TrendingUp, Zap, GitBranch, Bell,
  Activity, Terminal, ChevronRight
} from "lucide-react"
import Link from "next/link"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { RetroMenuBar } from "@/components/retro-menu-bar"
import { RetroFooter } from "@/components/retro-footer"

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

export function DemoRetro() {
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
    <div className="min-h-screen flex flex-col">
      <RetroMenuBar />

      {/* Desktop area */}
      <div className="flex-grow pt-12 pb-12 px-4">
        {/* Hero Section */}
        <section className="container mx-auto max-w-4xl text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Live CI/CD Pipeline Simulation
          </h1>
          <p className="text-xl mb-8">
            Watch StreamCI analyze a GitHub Actions workflow in real-time with predictive alerts and intelligent insights.
          </p>

          {/* Repository Panel */}
          <div className="retro-panel max-w-2xl mx-auto mb-6">
            <div className="panel-title-bar">
              <div className="panel-title">Repository Info</div>
            </div>
            <div className="panel-content">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GitBranch className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-bold text-xl">demo-user/awesome-app</p>
                    <p className="text-sm">Branch: main • Commit: a3f2b1c • "Add new feature"</p>
                  </div>
                </div>
                <span className={`px-3 py-1 border-2 border-[var(--border-color)] font-bold ${isRunning ? 'bg-[var(--color-run)] text-white' : 'bg-[var(--subtle-bg)]'}`}>
                  {isRunning ? "RUNNING" : "READY"}
                </span>
              </div>
            </div>
          </div>

          {/* Run Button */}
          <button
            onClick={runWorkflow}
            disabled={isRunning}
            className={`retro-btn retro-btn-primary flex items-center gap-2 mx-auto ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isRunning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Run Demo Workflow</span>
              </>
            )}
          </button>
        </section>

      {/* Section 2: Live Pipeline + Terminal */}
      <section className="container mx-auto max-w-6xl mb-12">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">Live Pipeline Execution</h2>
            <p>Watch each step execute in real-time</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Pipeline Flow */}
            <div className="lg:col-span-2">
              <div className="retro-panel">
                <div className="panel-title-bar">
                  <Activity className="w-5 h-5 mr-2" />
                  <div className="panel-title">Workflow Steps</div>
                </div>
                <div className="panel-content space-y-2">
                  {steps.map((step, idx) => (
                    <div
                      key={idx}
                      className={`relative flex items-center justify-between p-3 border-2 transition-all ${
                        step.status === "running"
                          ? "border-[var(--color-run)] bg-[var(--color-run)]/10"
                          : step.status === "success"
                            ? "border-[var(--color-success)]/30 bg-[var(--color-success)]/5"
                            : step.status === "failed"
                              ? "border-[var(--color-fail)] bg-[var(--color-fail)]/10"
                              : "border-[var(--border-color)] bg-[var(--subtle-bg)]"
                      }`}
                    >
                      {step.status === "running" && (
                        <div className="absolute inset-0 bg-[var(--color-run)]/5 animate-pulse" />
                      )}
                      <div className="flex items-center space-x-3 relative z-10">
                        <div className="flex-shrink-0">
                          {getStepIcon(step.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold truncate">{step.name}</p>
                          {step.duration > 0 && (
                            <p className="text-sm">
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
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Terminal Logs */}
            <div className="lg:col-span-1">
              <div className="retro-panel h-full">
                <div className="panel-title-bar">
                  <Terminal className="w-4 h-4 mr-2" />
                  <div className="panel-title">Console Output</div>
                </div>
                <div className="panel-content p-0">
                  <div className="bg-black p-3 h-[400px] lg:h-[600px] overflow-y-auto font-mono text-xs">
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
                            className={`${
                              log.type === 'error' ? 'text-red-400' :
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
                </div>
              </div>
            </div>
          </div>
      </section>

      {/* Section 3: Real-Time Metrics */}
      <section className="container mx-auto max-w-6xl mb-12">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">Real-Time Analytics</h2>
            <p>Performance metrics updating live</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Success Rate */}
            <div className="retro-panel">
              <div className="panel-title-bar">
                <div className="panel-title">Success Rate</div>
                <TrendingUp className="w-4 h-4 ml-auto" style={{ color: 'var(--color-success)' }} />
              </div>
              <div className="panel-content">
                <div className="text-4xl font-bold mb-4" style={{ color: 'var(--color-success)' }}>
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
              </div>
            </div>

            {/* Build Time */}
            <div className="retro-panel">
              <div className="panel-title-bar">
                <div className="panel-title">Avg Build Time</div>
                <Clock className="w-4 h-4 ml-auto" style={{ color: 'var(--accent-color)' }} />
              </div>
              <div className="panel-content">
                <div className="text-4xl font-bold mb-4" style={{ color: 'var(--accent-color)' }}>
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
              </div>
            </div>

            {/* Queue Length */}
            <div className="retro-panel">
              <div className="panel-title-bar">
                <div className="panel-title">Queue Length</div>
                <Activity className="w-4 h-4 ml-auto" style={{ color: 'var(--color-warn)' }} />
              </div>
              <div className="panel-content">
                <div className="text-4xl font-bold mb-4" style={{ color: 'var(--color-warn)' }}>
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
              </div>
            </div>

            {/* Active Runners */}
            <div className="retro-panel">
              <div className="panel-title-bar">
                <div className="panel-title">Active Runners</div>
                <Zap className="w-4 h-4 ml-auto" style={{ color: 'var(--color-queue)' }} />
              </div>
              <div className="panel-content">
                <div className="text-4xl font-bold mb-4" style={{ color: 'var(--color-queue)' }}>
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
              </div>
            </div>
          </div>
      </section>

      {/* Section 4: Predictive Alerts */}
      <section className="container mx-auto max-w-6xl mb-12">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">Predictive Alerts</h2>
            <p>Early warnings before problems impact your team</p>
          </div>

          <div className="retro-panel">
            <div className="panel-title-bar">
              <Bell className="w-5 h-5 mr-2" />
              <div className="panel-title">Alert Feed</div>
              <span className="ml-auto px-2 py-0.5 bg-[var(--subtle-bg)] border-2 border-[var(--border-color)] text-sm font-bold">
                {alerts.length} ACTIVE
              </span>
            </div>
            <div className="panel-content">
              {alerts.length === 0 ? (
                <div className="text-center py-12">
                  <Zap className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-xl mb-2">No alerts yet</p>
                  <p>Run the workflow to see intelligent insights</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map(alert => (
                    <div
                      key={alert.id}
                      className={`p-4 border-2 transition-all ${
                        alert.type === 'error' ? 'border-[var(--color-fail)] bg-[var(--color-fail)]/10' :
                        alert.type === 'warning' ? 'border-[var(--color-warn)] bg-[var(--color-warn)]/10' :
                        alert.type === 'success' ? 'border-[var(--color-success)] bg-[var(--color-success)]/10' :
                        'border-[var(--accent-color)] bg-[var(--accent-color)]/10'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{alert.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold mb-1">{alert.message}</p>
                          <p className="text-sm">
                            {alert.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
      </section>

      {/* Section 5: Historical Performance */}
      <section className="container mx-auto max-w-6xl mb-12">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">Build History Heatmap</h2>
            <p>Pattern recognition across 12 weeks</p>
          </div>

          <div className="retro-panel">
            <div className="panel-title-bar">
              <div className="panel-title">Build Activity</div>
            </div>
            <div className="panel-content">
              <div className="overflow-x-auto">
                <div className="inline-grid grid-rows-7 gap-1 min-w-max">
                  {[0, 1, 2, 3, 4, 5, 6].map(day => (
                    <div key={day} className="flex gap-1">
                      {Array.from({ length: 12 }).map((_, week) => {
                        const cell = heatmapData.find(d => d.week === week && d.day === day)
                        return (
                          <div
                            key={week}
                            className={`w-4 h-4 sm:w-5 sm:h-5 border-2 transition-all hover:scale-125 cursor-pointer ${
                              cell?.status === 'success'
                                ? 'bg-[var(--color-success)]/80 border-[var(--color-success)] hover:bg-[var(--color-success)]'
                                : cell?.status === 'failed'
                                  ? 'bg-[var(--color-fail)]/80 border-[var(--color-fail)] hover:bg-[var(--color-fail)]'
                                  : 'bg-[var(--subtle-bg)] border-[var(--border-color)]'
                            }`}
                            title={`Week ${week + 1}, ${cell?.builds || 0} builds`}
                          />
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between mt-6 text-sm">
                <span>12 weeks ago</span>
                <div className="flex items-center gap-2">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 bg-[var(--subtle-bg)] border-2 border-[var(--border-color)]" />
                    <div className="w-3 h-3 bg-[var(--color-success)]/40 border-2 border-[var(--color-success)]" />
                    <div className="w-3 h-3 bg-[var(--color-success)]/60 border-2 border-[var(--color-success)]" />
                    <div className="w-3 h-3 bg-[var(--color-success)]/80 border-2 border-[var(--color-success)]" />
                    <div className="w-3 h-3 bg-[var(--color-success)] border-2 border-[var(--color-success)]" />
                  </div>
                  <span>More</span>
                </div>
                <span>Today</span>
              </div>
            </div>
          </div>
      </section>

      {/* Section 6: Before vs After */}
      <section className="container mx-auto max-w-6xl mb-12">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">Traditional vs StreamCI Approach</h2>
            <p>Different ways to monitor CI/CD pipelines</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Before */}
            <div className="retro-panel border-[var(--color-fail)]">
              <div className="panel-title-bar" style={{ borderColor: 'var(--color-fail)' }}>
                <XCircle className="w-5 h-5 mr-2" style={{ color: 'var(--color-fail)' }} />
                <div className="panel-title" style={{ color: 'var(--color-fail)' }}>Traditional Monitoring</div>
              </div>
              <div className="panel-content">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="status-pixel" style={{ backgroundColor: 'var(--color-fail)' }} />
                    <p>Alerts after failures occur</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="status-pixel" style={{ backgroundColor: 'var(--color-fail)' }} />
                    <p>Limited visibility into patterns</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="status-pixel" style={{ backgroundColor: 'var(--color-fail)' }} />
                    <p>Reactive approach to issues</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="status-pixel" style={{ backgroundColor: 'var(--color-fail)' }} />
                    <p>Manual correlation across builds</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="status-pixel" style={{ backgroundColor: 'var(--color-fail)' }} />
                    <p>Basic metrics only</p>
                  </div>
                </div>
              </div>
            </div>

            {/* After */}
            <div className="retro-panel border-[var(--color-success)]">
              <div className="panel-title-bar" style={{ borderColor: 'var(--color-success)' }}>
                <CheckCircle className="w-5 h-5 mr-2" style={{ color: 'var(--color-success)' }} />
                <div className="panel-title" style={{ color: 'var(--color-success)' }}>StreamCI Approach</div>
              </div>
              <div className="panel-content">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="status-pixel" style={{ backgroundColor: 'var(--color-success)' }} />
                    <p>Early warning system for potential issues</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="status-pixel" style={{ backgroundColor: 'var(--color-success)' }} />
                    <p>Pattern detection across workflows</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="status-pixel" style={{ backgroundColor: 'var(--color-success)' }} />
                    <p>Proactive monitoring approach</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="status-pixel" style={{ backgroundColor: 'var(--color-success)' }} />
                    <p>Automated trend analysis</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="status-pixel" style={{ backgroundColor: 'var(--color-success)' }} />
                    <p>Real-time analytics and insights</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </section>

      {/* Section 7: What You Just Saw */}
      <section className="container mx-auto max-w-4xl text-center mb-12">
          <h2 className="text-4xl font-bold mb-6">
            What You Just Witnessed
          </h2>
          <p className="text-xl mb-8">
            Key features of StreamCI in action
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            <div className="retro-panel">
              <div className="panel-content text-center">
                <div className="w-12 h-12 border-2 border-[var(--accent-color)] flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--accent-color)' }}>
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold mb-2">Early Alerts</div>
                <p>Warning system for potential issues</p>
              </div>
            </div>

            <div className="retro-panel">
              <div className="panel-content text-center">
                <div className="w-12 h-12 border-2 border-[var(--color-success)] flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-success)' }}>
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold mb-2">Real-time</div>
                <p>Live pattern recognition</p>
              </div>
            </div>

            <div className="retro-panel">
              <div className="panel-content text-center">
                <div className="w-12 h-12 border-2 border-[var(--color-queue)] flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-queue)' }}>
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold mb-2">Automated</div>
                <p>Continuous monitoring</p>
              </div>
            </div>
          </div>

          <div className="retro-panel border-[var(--accent-color)]">
            <div className="panel-content py-8">
              <h3 className="text-3xl font-bold mb-4">
                Ready to monitor your CI/CD pipelines?
              </h3>
              <p className="mb-6 max-w-2xl mx-auto">
                Get real-time insights and analytics for your GitHub Actions workflows
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/sign-up">
                  <button className="retro-btn retro-btn-primary flex items-center gap-2">
                    <span>Get Started</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link href="/">
                  <button className="retro-btn">
                    Learn More
                  </button>
                </Link>
              </div>
            </div>
          </div>
      </section>
      </div>

      <RetroFooter />
    </div>
  )
}