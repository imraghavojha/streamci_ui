const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// Enhanced fetch wrapper
async function apiFetch(url: string, options: RequestInit = {}) {
    const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`

    try {
        const response = await fetch(fullUrl, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...options.headers,
            }
        })

        return response
    } catch (error) {
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

// Main API functions
export const api = {
    async checkHealth(): Promise<boolean> {
        try {
            const response = await apiFetch('/health')
            const isHealthy = response.ok

            if (isHealthy) {
                try {
                    await response.json()
                } catch (e) {
                    // Health endpoint responded OK but no JSON data
                }
            }

            return isHealthy
        } catch (error) {
            return false
        }
    },

    async getRealtimeDashboard(clerkUserId: string): Promise<RealtimeDashboard> {
        if (!clerkUserId) {
            throw new Error("User ID is required")
        }

        try {
            const response = await apiFetch(`/api/realtime/dashboard/${clerkUserId}`)

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`)
            }

            const data = await response.json()
            return data
        } catch (err) {
            throw err
        }
    },

    async refreshRealtimeDashboard(clerkUserId: string): Promise<RealtimeDashboard> {
        try {
            const response = await apiFetch(`/api/realtime/refresh/${clerkUserId}`, {
                method: 'POST'
            })

            if (!response.ok) {
                throw new Error(`Refresh failed: ${response.status}`)
            }

            const data = await response.json()
            return data
        } catch (err) {
            throw err
        }
    },

    async getDashboardSummary(): Promise<DashboardSummary> {
        try {
            const response = await apiFetch('/api/dashboard/summary')

            if (!response.ok) {
                throw new Error(`Failed to fetch dashboard summary: ${response.status}`)
            }

            const data = await response.json()

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
            throw err
        }
    },

    async getLiveBuildStatus(): Promise<{ running_builds: LiveBuild[], queue_depth: number }> {
        try {
            const response = await apiFetch('/api/dashboard/live')

            if (!response.ok) {
                throw new Error('Failed to fetch live status')
            }

            const data = await response.json()
            return data
        } catch (err) {
            throw err
        }
    },

    async getLiveBuilds(): Promise<LiveBuild[]> {
        try {
            const response = await this.getLiveBuildStatus()
            return response.running_builds || []
        } catch (err) {
            return []
        }
    },

    async getTrends(clerkUserId: string): Promise<TrendsData> {
        try {
            const response = await apiFetch(`/api/analytics/trends/${clerkUserId}`)

            if (!response.ok) {
                throw new Error(`Trends request failed: ${response.status}`)
            }

            const data = await response.json()
            return data
        } catch (err) {
            throw err
        }
    },

    async refreshDashboard(): Promise<void> {
        try {
            await apiFetch('/api/dashboard/refresh', { method: 'POST' })
        } catch (err) {
            throw err
        }
    },

    convertWorkflowsToDashboard(realtimeData: RealtimeDashboard): DashboardSummary {
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

        return result
    },

    async runDiagnostics(): Promise<{ [key: string]: boolean }> {
        const results: { [key: string]: boolean } = {}

        try {
            results.health = await this.checkHealth()
        } catch (e) {
            results.health = false
        }

        try {
            await this.getDashboardSummary()
            results.dashboardSummary = true
        } catch (e) {
            results.dashboardSummary = false
        }

        try {
            await this.getLiveBuilds()
            results.liveBuilds = true
        } catch (e) {
            results.liveBuilds = false
        }

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
