const express = require('express')
const cors = require('cors')
const WebSocket = require('ws')
const http = require('http')

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

// enable cors for frontend
app.use(cors())
app.use(express.json())

// data scenarios - can be switched easily
let currentScenario = 'normal' // 'empty', 'normal', 'busy', 'problems'

// mock data generators
const scenarios = {
    empty: {
        pipelines: [],
        builds: [],
        successRate: 0,
        totalBuilds: 0,
        activeAlerts: []
    },

    normal: {
        pipelines: [
            { id: 1, name: 'main-pipeline', status: 'active' },
            { id: 2, name: 'feature-auth', status: 'active' },
            { id: 3, name: 'hotfix-critical', status: 'completed' }
        ],
        builds: [
            { id: 1, status: 'running', branch: 'main', duration: '2m 45s', commit: 'Fix authentication flow', pipeline_name: 'main-pipeline' },
            { id: 2, status: 'success', branch: 'feature/ui', duration: '4m 12s', commit: 'Update dashboard styling', pipeline_name: 'feature-auth' },
            { id: 3, status: 'queued', branch: 'hotfix/bug', duration: '0s', commit: 'Critical security patch', pipeline_name: 'hotfix-critical' }
        ],
        successRate: 94.2,
        totalBuilds: 1247,
        activeAlerts: [
            {
                id: 1,
                type: 'performance',
                severity: 'warning',
                message: 'Build duration increased by 15% this week',
                created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            }
        ]
    },

    busy: {
        pipelines: [
            { id: 1, name: 'main-pipeline', status: 'active' },
            { id: 2, name: 'feature-auth', status: 'active' },
            { id: 3, name: 'feature-ui', status: 'active' },
            { id: 4, name: 'release-v2', status: 'active' },
            { id: 5, name: 'hotfix-critical', status: 'running' }
        ],
        builds: [
            { id: 1, status: 'running', branch: 'main', duration: '3m 21s', commit: 'Major refactor', pipeline_name: 'main-pipeline' },
            { id: 2, status: 'running', branch: 'feature/auth', duration: '1m 45s', commit: 'OAuth integration', pipeline_name: 'feature-auth' },
            { id: 3, status: 'queued', branch: 'feature/ui', duration: '0s', commit: 'New dashboard', pipeline_name: 'feature-ui' },
            { id: 4, status: 'queued', branch: 'release/v2', duration: '0s', commit: 'Version 2.0 release', pipeline_name: 'release-v2' },
            { id: 5, status: 'running', branch: 'hotfix/critical', duration: '45s', commit: 'Emergency fix', pipeline_name: 'hotfix-critical' }
        ],
        successRate: 87.6,
        totalBuilds: 2841,
        activeAlerts: []
    },

    problems: {
        pipelines: [
            { id: 1, name: 'main-pipeline', status: 'failed' },
            { id: 2, name: 'feature-auth', status: 'active' },
            { id: 3, name: 'legacy-system', status: 'failing' }
        ],
        builds: [
            { id: 1, status: 'failed', branch: 'main', duration: '1m 23s', commit: 'Breaking change', pipeline_name: 'main-pipeline' },
            { id: 2, status: 'failed', branch: 'feature/auth', duration: '2m 45s', commit: 'Test failures', pipeline_name: 'feature-auth' },
            { id: 3, status: 'running', branch: 'hotfix/urgent', duration: '4m 12s', commit: 'Fix broken tests', pipeline_name: 'main-pipeline' }
        ],
        successRate: 68.4,
        totalBuilds: 892,
        activeAlerts: [
            {
                id: 1,
                type: 'failure_rate',
                severity: 'critical',
                message: 'Success rate dropped below 70%',
                created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
            },
            {
                id: 2,
                type: 'flaky_test',
                severity: 'warning',
                message: 'Flaky test detected: auth.spec.js fails intermittently',
                created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
            }
        ]
    }
}

// generate realistic trend data
function generateTrendData(days = 7, baseRate = 94.2) {
    const trends = []
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const variation = (Math.random() - 0.5) * 10 // +/- 5% variation
        trends.push({
            timestamp: date.toISOString(),
            success_rate: Math.max(70, Math.min(99, baseRate + variation))
        })
    }
    return trends
}

// api endpoints matching your backend exactly
app.get('/api/dashboard/summary', (req, res) => {
    const data = scenarios[currentScenario]

    const summary = {
        timestamp: new Date().toISOString(),
        status: 'success',
        total_pipelines: data.pipelines.length,
        overview: {
            total_success_rate: data.successRate,
            total_builds: data.totalBuilds,
            total_successful_builds: Math.floor(data.totalBuilds * data.successRate / 100),
            total_failed_builds: Math.floor(data.totalBuilds * (100 - data.successRate) / 100)
        },
        recent_activity: {
            builds_last_24h: Math.floor(data.totalBuilds * 0.02), // 2% of total
            successful_builds_last_24h: Math.floor(data.totalBuilds * 0.018), // 1.8% of total
            failed_builds_last_24h: Math.floor(data.totalBuilds * 0.002) // 0.2% of total
        },
        active_alerts: data.activeAlerts,
        queue_status: {
            current_depth: data.builds.filter(b => b.status === 'queued').length,
            average_wait_time: 45, // seconds
            predicted_peak_time: '14:30'
        },
        pipelines: data.pipelines.map(p => ({
            id: p.id,
            name: p.name,
            success_rate: data.successRate + (Math.random() - 0.5) * 10,
            total_builds: Math.floor(data.totalBuilds / data.pipelines.length),
            last_build_status: p.status === 'failed' ? 'failed' : 'success'
        }))
    }

    console.log(`📊 dashboard summary requested - scenario: ${currentScenario}`)
    res.json(summary)
})

app.get('/api/dashboard/live', (req, res) => {
    const data = scenarios[currentScenario]

    const liveData = {
        timestamp: new Date().toISOString(),
        running_builds: data.builds,
        queue_depth: data.builds.filter(b => b.status === 'queued').length,
        concurrent_limit: 5
    }

    console.log(`🔴 live status requested - ${data.builds.length} builds`)
    res.json(liveData)
})

app.get('/api/trends', (req, res) => {
    const days = parseInt(req.query.days) || 7
    const data = scenarios[currentScenario]

    const trends = {
        timestamp: new Date().toISOString(),
        period_days: days,
        success_rate_trend: generateTrendData(days, data.successRate),
        build_frequency: Array.from({ length: days }, (_, i) => ({
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
            builds: Math.floor(Math.random() * 50) + 10
        })),
        duration_trend: Array.from({ length: days }, (_, i) => ({
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
            average_duration: Math.floor(Math.random() * 120) + 180 // 3-5 minutes
        }))
    }

    console.log(`📊 trends requested for ${days} days`)
    res.json(trends)
})

// additional endpoints your backend has
app.get('/api/pipelines', (req, res) => {
    const data = scenarios[currentScenario]
    console.log(`🔧 pipelines list requested - ${data.pipelines.length} pipelines`)
    res.json(data.pipelines)
})

app.get('/api/builds', (req, res) => {
    const data = scenarios[currentScenario]
    // generate more historical builds
    const allBuilds = [
        ...data.builds,
        ...Array.from({ length: 20 }, (_, i) => ({
            id: 100 + i,
            status: Math.random() > 0.15 ? 'success' : 'failed',
            branch: `feature/branch-${i}`,
            duration: `${Math.floor(Math.random() * 5) + 1}m ${Math.floor(Math.random() * 60)}s`,
            commit: `Commit message ${i}`,
            created_at: new Date(Date.now() - i * 60 * 60 * 1000).toISOString()
        }))
    ]
    console.log(`🔨 builds list requested - ${allBuilds.length} builds`)
    res.json(allBuilds)
})

app.get('/api/alerts', (req, res) => {
    const data = scenarios[currentScenario]
    console.log(`⚠️ alerts requested - ${data.activeAlerts.length} active`)
    res.json(data.activeAlerts)
})

// scenario switching endpoint for easy testing
app.post('/api/mock/scenario/:scenario', (req, res) => {
    const newScenario = req.params.scenario
    if (scenarios[newScenario]) {
        currentScenario = newScenario
        console.log(`🎭 scenario switched to: ${newScenario}`)

        // broadcast scenario change via websocket
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'scenario_change',
                    scenario: newScenario,
                    timestamp: new Date().toISOString()
                }))
            }
        })

        res.json({ status: 'success', scenario: newScenario })
    } else {
        res.status(400).json({ error: 'invalid scenario', available: Object.keys(scenarios) })
    }
})

app.get('/api/mock/scenarios', (req, res) => {
    res.json({
        current: currentScenario,
        available: Object.keys(scenarios),
        description: {
            empty: 'No data - fresh installation',
            normal: 'Healthy system with good metrics',
            busy: 'High activity with many concurrent builds',
            problems: 'System with issues and alerts'
        }
    })
})

// websocket for live updates
wss.on('connection', (ws) => {
    console.log('📡 websocket client connected')

    // send initial data
    ws.send(JSON.stringify({
        type: 'connection',
        message: 'connected to mock streamci api',
        scenario: currentScenario,
        timestamp: new Date().toISOString()
    }))

    // simulate periodic updates
    const updateInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'dashboard_update',
                scenario: currentScenario,
                timestamp: new Date().toISOString(),
                random_metric: Math.floor(Math.random() * 100)
            }))
        }
    }, 30000) // every 30 seconds

    ws.on('close', () => {
        console.log('📡 websocket client disconnected')
        clearInterval(updateInterval)
    })
})

// health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'streamci-mock-api',
        scenario: currentScenario,
        timestamp: new Date().toISOString()
    })
})

// root endpoint with usage info
app.get('/', (req, res) => {
    res.json({
        service: 'StreamCI Mock API',
        version: '1.0.0',
        current_scenario: currentScenario,
        endpoints: {
            'GET /api/dashboard/summary': 'Dashboard overview',
            'GET /api/dashboard/live': 'Live build status',
            'GET /api/trends?days=7': 'Historical trends',
            'GET /api/pipelines': 'All pipelines',
            'GET /api/builds': 'All builds',
            'GET /api/alerts': 'Active alerts',
            'POST /api/mock/scenario/{scenario}': 'Switch data scenario',
            'GET /api/mock/scenarios': 'List available scenarios',
            'WS /': 'WebSocket for live updates'
        },
        usage: 'Perfect for frontend development and API testing'
    })
})

const PORT = process.env.PORT || 8080
server.listen(PORT, () => {
    console.log(`🚀 StreamCI Mock API running on port ${PORT}`)
    console.log(`📊 Current scenario: ${currentScenario}`)
    console.log(`🔗 API available at: http://localhost:${PORT}`)
    console.log(`📡 WebSocket available at: ws://localhost:${PORT}`)
    console.log(`\n🎭 Switch scenarios:`)
    Object.keys(scenarios).forEach(scenario => {
        console.log(`   curl -X POST http://localhost:${PORT}/api/mock/scenario/${scenario}`)
    })
})