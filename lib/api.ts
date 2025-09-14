// api service for streamci backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// types based on backend api responses
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

// real-time workflow data from github
export interface WorkflowData {
    id: number
    name: string
    status: string
    conclusion: string
    created_at: string
    repository: string
}

export interface RealtimeDashboard {
    workflows: WorkflowData[]
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

// main api functions
export const api = {
    // real-time dashboard data from selected repositories
    async getRealtimeDashboard(clerkUserId: string): Promise<RealtimeDashboard> {
        try {
            const response = await fetch(`${API_URL}/api/realtime/dashboard/${clerkUserId}`)
            if (!response.ok) {
                throw new Error(`api request failed: ${response.status}`)
            }
            return await response.json()
        } catch (err) {
            console.error('failed to fetch realtime dashboard:', err)
            throw err
        }
    },

    // force refresh real-time data (clears cache)
    async refreshRealtimeDashboard(clerkUserId: string): Promise<RealtimeDashboard> {
        try {
            const response = await fetch(`${API_URL}/api/realtime/refresh/${clerkUserId}`, {
                method: 'POST'
            })
            if (!response.ok) {
                throw new Error(`refresh failed: ${response.status}`)
            }
            return await response.json()
        } catch (err) {
            console.error('failed to refresh realtime dashboard:', err)
            throw err
        }
    },

    // convert workflow data to dashboard summary format
    convertWorkflowsToDashboard(realtimeData: RealtimeDashboard): DashboardSummary {
        const workflows = realtimeData.workflows || []
        const totalBuilds = workflows.length
        const successfulBuilds = workflows.filter(w => w.conclusion === 'success').length
        const failedBuilds = workflows.filter(w => w.conclusion === 'failure').length
        const runningBuilds = workflows.filter(w => w.status === 'in_progress' || w.status === 'queued').length

        const successRate = totalBuilds > 0 ? (successfulBuilds / totalBuilds) * 100 : 0

        // group workflows by repository to create "pipelines"
        const repoGroups = workflows.reduce((acc, workflow) => {
            const repo = workflow.repository
            if (!acc[repo]) acc[repo] = []
            acc[repo].push(workflow)
            return acc
        }, {} as Record<string, WorkflowData[]>)

        const pipelines = Object.entries(repoGroups).map(([repo, repoWorkflows]) => {
            const repoSuccess = repoWorkflows.filter(w => w.conclusion === 'success').length
            const repoTotal = repoWorkflows.length
            const repoSuccessRate = repoTotal > 0 ? (repoSuccess / repoTotal) * 100 : 0
            const lastWorkflow = repoWorkflows[0]

            return {
                id: repo.hashCode ? repo.hashCode() : Math.random(),
                name: repo,
                success_rate: repoSuccessRate,
                total_builds: repoTotal,
                last_build_status: lastWorkflow?.conclusion || 'unknown'
            }
        })

        return {
            timestamp: realtimeData.lastUpdated || new Date().toISOString(),
            status: realtimeData.error ? 'error' : 'success',
            total_pipelines: Object.keys(repoGroups).length,
            overview: {
                total_success_rate: successRate,
                total_builds: totalBuilds,
                total_successful_builds: successfulBuilds,
                total_failed_builds: failedBuilds,
            },
            recent_activity: {
                builds_last_24h: totalBuilds, // simplification for now
                successful_builds_last_24h: successfulBuilds,
                failed_builds_last_24h: failedBuilds,
            },
            active_alerts: realtimeData.error ? [{
                id: 1,
                type: 'error',
                severity: 'error',
                message: realtimeData.error,
                created_at: new Date().toISOString()
            }] : [],
            pipelines: pipelines
        }
    },

    // legacy mock api functions (keeping for fallback)
    async getDashboardSummary(): Promise<DashboardSummary> {
        try {
            const response = await fetch(`${API_URL}/api/dashboard/summary`)
            if (!response.ok) {
                throw new Error(`api request failed: ${response.status}`)
            }
            const data = await response.json()

            return {
                timestamp: data.timestamp || new Date().toISOString(),
                status: data.status || 'unknown',
                total_pipelines: data.total_pipelines || 0,
                overview: {
                    total_success_rate: data.overview?.total_success_rate || 0,
                    total_builds: data.overview?.total_builds || 0,
                    total_successful_builds: data.overview?.total_successful_builds || 0,
                    total_failed_builds: data.overview?.total_failed_builds || 0,
                },
                recent_activity: {
                    builds_last_24h: data.recent_activity?.builds_last_24h || 0,
                    successful_builds_last_24h: data.recent_activity?.successful_builds_last_24h || 0,
                    failed_builds_last_24h: data.recent_activity?.failed_builds_last_24h || 0,
                },
                active_alerts: data.active_alerts || [],
                pipelines: data.pipelines || []
            }
        } catch (err) {
            console.error('failed to fetch dashboard summary:', err)
            throw err
        }
    },

    async getLiveBuildStatus(): Promise<{ running_builds: LiveBuild[], queue_depth: number }> {
        const response = await fetch(`${API_URL}/api/dashboard/live`)
        if (!response.ok) throw new Error('failed to fetch live status')
        return await response.json()
    },

    async getTrends(days: number = 7): Promise<TrendData[]> {
        const response = await fetch(`${API_URL}/api/trends?days=${days}`)
        if (!response.ok) throw new Error('failed to fetch trends')
        const data = await response.json()

        if (data.success_rate_trend) {
            return data.success_rate_trend.map((point: any) => ({
                date: new Date(point.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                }),
                successRate: Math.round(point.success_rate)
            }))
        }

        const summary = await this.getDashboardSummary()
        const baseRate = summary.overview.total_success_rate
        return Array.from({ length: 7 }, (_, i) => ({
            date: `Jan ${i + 1}`,
            successRate: Math.round(baseRate + (Math.random() - 0.5) * 10)
        }))
    },

    async refreshDashboard(): Promise<void> {
        await fetch(`${API_URL}/api/dashboard/refresh`, { method: 'POST' })
    },

    async checkHealth(): Promise<boolean> {
        try {
            const response = await fetch(`${API_URL}/health`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            })
            return response.ok
        } catch {
            return false
        }
    }
}

// import the enhanced websocket service
export { WebSocketService } from './websocket'

// add string hashcode for pipeline id generation
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