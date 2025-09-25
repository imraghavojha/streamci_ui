// ENHANCED VERSION WITH COMPREHENSIVE DEBUG LOGGING
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// LOG EVERYTHING - REMOVE IN PRODUCTION
console.log("🔧 API Configuration Loaded:")
console.log("- NEXT_PUBLIC_API_URL env var:", process.env.NEXT_PUBLIC_API_URL)
console.log("- Final API_URL being used:", API_URL)
console.log("- Environment check - all env vars:", {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
})

// Enhanced fetch wrapper with detailed logging
async function debugFetch(url: string, options: RequestInit = {}) {
    const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`

    console.log("🌐 Making API Request:")
    console.log("- Full URL:", fullUrl)
    console.log("- Method:", options.method || 'GET')
    console.log("- Headers:", options.headers)
    console.log("- Body:", options.body)
    console.log("- Options:", options)

    // Test if we can even reach the domain
    const urlObj = new URL(fullUrl)
    console.log("- Parsed URL - Host:", urlObj.host, "Protocol:", urlObj.protocol, "Pathname:", urlObj.pathname)

    try {
        const startTime = Date.now()
        const response = await fetch(fullUrl, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...options.headers,
            }
        })

        const responseTime = Date.now() - startTime

        console.log("📨 API Response Received:")
        console.log("- Status:", response.status)
        console.log("- Status Text:", response.statusText)
        console.log("- Response Time:", responseTime + "ms")
        console.log("- Headers:", Object.fromEntries(response.headers.entries()))
        console.log("- URL:", response.url)
        console.log("- Response OK:", response.ok)
        console.log("- Response Type:", response.type)

        // Log response body (clone to avoid consuming it)
        const responseClone = response.clone()
        try {
            const responseText = await responseClone.text()
            console.log("- Response Body (text):", responseText)
        } catch (e) {
            console.log("- Could not read response body as text:", e)
        }

        return response
    } catch (error) {
        console.error("🚨 FETCH ERROR DETAILS:")
        console.error("- Error name:", error.name)
        console.error("- Error message:", error.message)
        console.error("- Error stack:", error.stack)
        console.error("- Full error object:", error)

        // Check for specific network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error("🔥 NETWORK ERROR - Possible causes:")
            console.error("1. Backend server is down")
            console.error("2. CORS policy blocking request")
            console.error("3. DNS resolution failed")
            console.error("4. SSL/TLS certificate issues")
            console.error("5. Network connectivity issues")
            console.error("6. Incorrect URL:", fullUrl)
        }

        throw error
    }
}

export interface DashboardSummary {
    timestamp: string
    status: string
    total_pipelines: number
    overview: {
        total_success_rate: number
        total_builds: number
        total_successful_builds: number
        total_failed_builds: number
    }
    recent_activity: {
        builds_last_24h: number
        successful_builds_last_24h: number
        failed_builds_last_24h: number
    }
    active_alerts: AlertData[]
    pipelines: PipelineData[]
}

export interface RealtimeDashboard {
    workflows: any[]
    lastUpdated: string
    totalWorkflows: number
    selectedRepos?: string[]
    error?: string
}

export interface LiveBuild {
    id: number
    status: string
    branch: string
    commit: string
    duration: string
    pipeline_name?: string
}

export interface TrendData {
    date: string
    successRate: number
    buildCount?: number
}

export interface AlertData {
    id: number
    type: string
    severity: string
    message: string
    created_at: string
}

export interface PipelineData {
    id: number
    name: string
    success_rate: number
    total_builds: number
    last_build_status: string
}

export interface TrendsData {
    success_rate_trends: Array<{
        date: string
        success_rate: number
        total_builds: number
        successful_builds: number
    }>
    failure_patterns: Array<{
        repository: string
        failure_count: number
        total_builds: number
        failure_rate: number
    }>
    build_stats: {
        total_builds: number
        successful_builds: number
        failed_builds: number
        running_builds: number
        builds_analyzed: number
    }
    total_workflows_analyzed: number
    timestamp: string
}

// Main API functions with enhanced debugging
export const api = {
    // Health check function - test this first!
    async checkHealth(): Promise<boolean> {
        console.log("🏥 Starting health check...")
        try {
            const response = await debugFetch('/health')
            const isHealthy = response.ok
            console.log("🏥 Health check result:", isHealthy ? "HEALTHY ✅" : "UNHEALTHY ❌")

            if (isHealthy) {
                try {
                    const healthData = await response.json()
                    console.log("🏥 Health data:", healthData)
                } catch (e) {
                    console.log("🏥 Health endpoint responded OK but no JSON data")
                }
            }

            return isHealthy
        } catch (error) {
            console.error("🏥 Health check failed:", error)
            return false
        }
    },

    // Real-time dashboard data from selected repositories
    async getRealtimeDashboard(clerkUserId: string): Promise<RealtimeDashboard> {
        console.log("🔄 Fetching realtime dashboard for user:", clerkUserId)

        if (!clerkUserId) {
            console.error("🚨 ERROR: No clerkUserId provided to getRealtimeDashboard")
            throw new Error("User ID is required")
        }

        try {
            const response = await debugFetch(`/api/realtime/dashboard/${clerkUserId}`)

            if (!response.ok) {
                console.error(`🚨 Realtime dashboard API failed with status: ${response.status}`)
                throw new Error(`API request failed: ${response.status} ${response.statusText}`)
            }

            const data = await response.json()
            console.log("✅ Realtime dashboard data received:", data)
            return data
        } catch (err) {
            console.error('🚨 Failed to fetch realtime dashboard:', err)
            throw err
        }
    },

    // Force refresh real-time data (clears cache)
    async refreshRealtimeDashboard(clerkUserId: string): Promise<RealtimeDashboard> {
        console.log("🔄 Refreshing realtime dashboard for user:", clerkUserId)

        try {
            const response = await debugFetch(`/api/realtime/refresh/${clerkUserId}`, {
                method: 'POST'
            })

            if (!response.ok) {
                console.error(`🚨 Refresh dashboard API failed with status: ${response.status}`)
                throw new Error(`Refresh failed: ${response.status}`)
            }

            const data = await response.json()
            console.log("✅ Refresh dashboard data received:", data)
            return data
        } catch (err) {
            console.error('🚨 Failed to refresh realtime dashboard:', err)
            throw err
        }
    },

    // Dashboard summary (fallback method)
    async getDashboardSummary(): Promise<DashboardSummary> {
        console.log("📊 Fetching dashboard summary...")

        try {
            const response = await debugFetch('/api/dashboard/summary')

            if (!response.ok) {
                console.error(`🚨 Dashboard summary API failed with status: ${response.status}`)
                throw new Error(`Failed to fetch dashboard summary: ${response.status}`)
            }

            const data = await response.json()
            console.log("✅ Dashboard summary data received:", data)

            return {
                timestamp: data.timestamp || new Date().toISOString(),
                status: data.status || 'unknown',
                total_pipelines: data.total_pipelines || 0,
                overview: data.overview || {
                    total_success_rate: 0,
                    total_builds: 0,
                    total_successful_builds: 0,
                    total_failed_builds: 0,
                },
                recent_activity: data.recent_activity || {
                    builds_last_24h: 0,
                    successful_builds_last_24h: 0,
                    failed_builds_last_24h: 0,
                },
                active_alerts: data.active_alerts || [],
                pipelines: data.pipelines || []
            }
        } catch (err) {
            console.error('🚨 Failed to fetch dashboard summary:', err)
            throw err
        }
    },

    async getLiveBuildStatus(): Promise<{ running_builds: LiveBuild[], queue_depth: number }> {
        console.log("🔴 Fetching live build status...")

        try {
            const response = await debugFetch('/api/dashboard/live')

            if (!response.ok) {
                console.error(`🚨 Live status API failed with status: ${response.status}`)
                throw new Error('Failed to fetch live status')
            }

            const data = await response.json()
            console.log("✅ Live status data received:", data)
            return data
        } catch (err) {
            console.error('🚨 Failed to fetch live build status:', err)
            throw err
        }
    },

    async getLiveBuilds(): Promise<LiveBuild[]> {
        console.log("📋 Getting live builds list...")
        try {
            const response = await this.getLiveBuildStatus()
            console.log("✅ Live builds received:", response.running_builds?.length || 0, "builds")
            return response.running_builds || []
        } catch (err) {
            console.error('🚨 Failed to get live builds:', err)
            return []
        }
    },

    async getTrends(clerkUserId: string): Promise<TrendsData> {
        console.log("📈 Fetching trends for user:", clerkUserId)

        try {
            const response = await debugFetch(`/api/analytics/trends/${clerkUserId}`)

            if (!response.ok) {
                console.error(`🚨 Trends API failed with status: ${response.status}`)
                throw new Error(`Trends request failed: ${response.status}`)
            }

            const data = await response.json()
            console.log("✅ Trends data received:", data)
            return data
        } catch (err) {
            console.error('🚨 Failed to fetch trends:', err)
            throw err
        }
    },

    async refreshDashboard(): Promise<void> {
        console.log("🔄 Refreshing dashboard...")
        try {
            await debugFetch('/api/dashboard/refresh', { method: 'POST' })
            console.log("✅ Dashboard refresh completed")
        } catch (err) {
            console.error('🚨 Failed to refresh dashboard:', err)
            throw err
        }
    },

    // Convert workflow data to dashboard summary format
    convertWorkflowsToDashboard(realtimeData: RealtimeDashboard): DashboardSummary {
        console.log("🔄 Converting workflows to dashboard format...")
        console.log("- Input data:", realtimeData)

        const workflows = realtimeData.workflows || []
        const totalBuilds = workflows.length
        const successfulBuilds = workflows.filter(w => w.conclusion === 'success').length
        const failedBuilds = workflows.filter(w => w.conclusion === 'failure').length
        const successRate = totalBuilds > 0 ? (successfulBuilds / totalBuilds) * 100 : 0

        const result: DashboardSummary = {
            timestamp: realtimeData.lastUpdated || new Date().toISOString(),
            status: 'success',
            total_pipelines: (realtimeData.selectedRepos || []).length,
            overview: {
                total_success_rate: Math.round(successRate),
                total_builds: totalBuilds,
                total_successful_builds: successfulBuilds,
                total_failed_builds: failedBuilds,
            },
            recent_activity: {
                builds_last_24h: totalBuilds,
                successful_builds_last_24h: successfulBuilds,
                failed_builds_last_24h: failedBuilds,
            },
            active_alerts: [],
            pipelines: (realtimeData.selectedRepos || []).map((repo, index) => ({
                id: repo.hashCode ? repo.hashCode() : index,
                name: repo,
                success_rate: Math.round(successRate),
                total_builds: Math.floor(totalBuilds / (realtimeData.selectedRepos?.length || 1)),
                last_build_status: workflows.length > 0 ? workflows[0].conclusion : 'unknown',
            }))
        }

        console.log("✅ Conversion completed:", result)
        return result
    },

    // Test all endpoints sequentially
    async runDiagnostics(): Promise<{ [key: string]: boolean }> {
        console.log("🔍 Running complete API diagnostics...")

        const results: { [key: string]: boolean } = {}

        // Test health endpoint
        try {
            results.health = await this.checkHealth()
        } catch (e) {
            results.health = false
            console.error("Health check failed:", e)
        }

        // Test dashboard summary
        try {
            await this.getDashboardSummary()
            results.dashboardSummary = true
        } catch (e) {
            results.dashboardSummary = false
            console.error("Dashboard summary failed:", e)
        }

        // Test live builds
        try {
            await this.getLiveBuilds()
            results.liveBuilds = true
        } catch (e) {
            results.liveBuilds = false
            console.error("Live builds failed:", e)
        }

        console.log("🔍 Diagnostics complete:", results)
        return results
    }
}

// Import the websocket service
export { WebSocketService } from './websocket'

// Add string hashcode for pipeline id generation
declare global {
    interface String {
        hashCode(): number;
    }
}

String.prototype.hashCode = function () {
    let hash = 0;
    if (this.length === 0) return hash;
    for (let i = 0; i < this.length; i++) {
        const char = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // convert to 32-bit integer
    }
    return Math.abs(hash);
};