"use client"

// simple component to test api connectivity - add to dashboard temporarily
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"

export function ApiTest() {
    const [status, setStatus] = useState<string>('not tested')
    const [response, setResponse] = useState<any>(null)

    const testApi = async () => {
        setStatus('testing...')
        try {
            // test the main dashboard endpoint
            const data = await api.getDashboardSummary()
            setStatus('success')
            setResponse(data)
        } catch (error) {
            setStatus('failed')
            setResponse({ error: error.message })
        }
    }

    const testRawApi = async () => {
        setStatus('testing raw...')
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
            const response = await fetch(`${API_URL}/api/dashboard/summary`)
            const data = await response.json()
            setStatus('raw success')
            setResponse(data)
        } catch (error) {
            setStatus('raw failed')
            setResponse({ error: error.message })
        }
    }

    return (
        <Card className="border-border mb-4">
            <CardHeader>
                <CardTitle className="text-sm">API Connectivity Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex space-x-2">
                    <Button size="sm" onClick={testApi}>Test API Service</Button>
                    <Button size="sm" variant="outline" onClick={testRawApi}>Test Raw Fetch</Button>
                </div>

                <div className="flex items-center space-x-2">
                    <span className="text-sm">Status:</span>
                    <Badge variant={status.includes('success') ? 'default' : status.includes('failed') ? 'destructive' : 'secondary'}>
                        {status}
                    </Badge>
                </div>

                {response && (
                    <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">Response:</p>
                        <pre className="text-xs bg-muted p-2 rounded max-h-32 overflow-auto">
                            {JSON.stringify(response, null, 2)}
                        </pre>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}