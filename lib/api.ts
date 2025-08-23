
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchDashboardSummary() {
    const response = await fetch(`${API_URL}/api/dashboard/summary`);
    if (!response.ok) {
        throw new Error('Failed to fetch dashboard summary');
    }
    return response.json();
}

export async function fetchPipelineHealth(pipelineId: number) {
    const response = await fetch(`${API_URL}/api/dashboard/health/${pipelineId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch pipeline health');
    }
    return response.json();
}
// ... add more functions for other endpoints as you need them