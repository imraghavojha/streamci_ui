// components/api-connectivity-tester.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, Wifi, WifiOff, TestTube } from "lucide-react"

interface TestResult {
    test: string
    status: 'success' | 'error' | 'pending'
    message: string
    details?: any
    duration?: number
}

export function ApiConnectivityTester() {
    const [results, setResults] = useState<TestResult[]>([])
    const [testing, setTesting] = useState(false)

    const addResult = (result: TestResult) => {
        setResults(prev => [...prev, result])
    }

    const runAllTests = async () => {
        setTesting(true)
        setResults([])

        // Test 1: Environment variables
        addResult({
            test: "Environment Check",
            status: process.env.NEXT_PUBLIC_API_URL ? 'success' : 'error',
            message: process.env.NEXT_PUBLIC_API_URL
                ? `API URL configured: ${process.env.NEXT_PUBLIC_API_URL}`
                : "NEXT_PUBLIC_API_URL not set",
            details: {
                NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
                NODE_ENV: process.env.NODE_ENV,
                VERCEL_ENV: process.env.VERCEL_ENV
            }
        })

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

        // Test 2: Health endpoint
        try {
            const startTime = Date.now()
            const response = await fetch(`${API_URL}/health`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            })
            const duration = Date.now() - startTime

            if (response.ok) {
                const data = await response.json()
                addResult({
                    test: "Health Check",
                    status: 'success',
                    message: `Backend is healthy (${duration}ms)`,
                    details: data,
                    duration
                })
            } else {
                addResult({
                    test: "Health Check",
                    status: 'error',
                    message: `Health check failed: ${response.status} ${response.statusText}`,
                    details: { status: response.status, statusText: response.statusText },
                    duration
                })
            }
        } catch (error: any) {
            addResult({
                test: "Health Check",
                status: 'error',
                message: `Network error: ${error.message}`,
                details: { error: error.message, name: error.name }
            })
        }

        // Test 3: CORS preflight
        try {
            const startTime = Date.now()
            const response = await fetch(`${API_URL}/api/setup/token`, {
                method: 'OPTIONS',
            })
            const duration = Date.now() - startTime

            addResult({
                test: "CORS Preflight",
                status: response.ok ? 'success' : 'error',
                message: response.ok
                    ? `CORS preflight passed (${duration}ms)`
                    : `CORS preflight failed: ${response.status}`,
                details: {
                    status: response.status,
                    headers: Object.fromEntries(response.headers.entries())
                },
                duration
            })
        } catch (error: any) {
            addResult({
                test: "CORS Preflight",
                status: 'error',
                message: `CORS test failed: ${error.message}`,
                details: error
            })
        }

        // Test 4: Dashboard Summary endpoint
        try {
            const startTime = Date.now()
            const response = await fetch(`${API_URL}/api/dashboard/summary`)
            const duration = Date.now() - startTime

            if (response.ok) {
                const data = await response.json()
                addResult({
                    test: "Dashboard API",
                    status: 'success',
                    message: `Dashboard API working (${duration}ms)`,
                    details: data,
                    duration
                })
            } else {
                addResult({
                    test: "Dashboard API",
                    status: 'error',
                    message: `Dashboard API failed: ${response.status}`,
                    details: { status: response.status, statusText: response.statusText },
                    duration
                })
            }
        } catch (error: any) {
            addResult({
                test: "Dashboard API",
                status: 'error',
                message: `Dashboard API error: ${error.message}`,
                details: error
            })
        }

        // Test 5: DNS resolution test
        try {
            const url = new URL(API_URL)
            addResult({
                test: "URL Parsing",
                status: 'success',
                message: `URL parsed successfully`,
                details: {
                    protocol: url.protocol,
                    hostname: url.hostname,
                    port: url.port,
                    pathname: url.pathname
                }
            })
        } catch (error: any) {
            addResult({
                test: "URL Parsing",
                status: 'error',
                message: `Invalid URL: ${error.message}`,
                details: { url: API_URL, error: error.message }
            })
        }

        setTesting(false)
    }

    const getStatusIcon = (status: TestResult['status']) => {
        switch (status) {
            case 'success':
                return <CheckCircle className="w-4 h-4 text-green-500" />
            case 'error':
                return <XCircle className="w-4 h-4 text-red-500" />
            case 'pending':
                return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
        }
    }

    const getStatusColor = (status: TestResult['status']) => {
        switch (status) {
            case 'success':
                return 'text-green-700 bg-green-50 border-green-200'
            case 'error':
                return 'text-red-700 bg-red-50 border-red-200'
            case 'pending':
                return 'text-blue-700 bg-blue-50 border-blue-200'
        }
    }

    const overallStatus = results.length === 0 ? 'pending' :
        results.some(r => r.status === 'error') ? 'error' : 'success'

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TestTube className="w-5 h-5" />
                    API Connectivity Test
                    {overallStatus === 'success' ? (
                        <Wifi className="w-4 h-4 text-green-500" />
                    ) : overallStatus === 'error' ? (
                        <WifiOff className="w-4 h-4 text-red-500" />
                    ) : null}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button
                    onClick={runAllTests}
                    disabled={testing}
                    className="w-full"
                >
                    {testing ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Running Tests...
                        </>
                    ) : (
                        <>
                            <TestTube className="w-4 h-4 mr-2" />
                            Run Connectivity Tests
                        </>
                    )}
                </Button>

                {results.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Test Results:</h4>
                        {results.map((result, index) => (
                            <div
                                key={index}
                                className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(result.status)}
                                        <span className="font-medium text-sm">{result.test}</span>
                                        {result.duration && (
                                            <Badge variant="outline" className="text-xs">
                                                {result.duration}ms
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm mt-1 ml-6">{result.message}</p>
                                {result.details && (
                                    <details className="mt-2 ml-6">
                                        <summary className="text-xs cursor-pointer text-muted-foreground">
                                            Show Details
                                        </summary>
                                        <pre className="text-xs bg-muted p-2 rounded mt-1 max-h-32 overflow-auto">
                                            {JSON.stringify(result.details, null, 2)}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {results.length > 0 && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                        <h4 className="font-semibold text-sm mb-2">Summary:</h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-lg font-bold text-green-600">
                                    {results.filter(r => r.status === 'success').length}
                                </div>
                                <div className="text-xs text-muted-foreground">Passed</div>
                            </div>
                            <div>
                                <div className="text-lg font-bold text-red-600">
                                    {results.filter(r => r.status === 'error').length}
                                </div>
                                <div className="text-xs text-muted-foreground">Failed</div>
                            </div>
                            <div>
                                <div className="text-lg font-bold">
                                    {results.length}
                                </div>
                                <div className="text-xs text-muted-foreground">Total</div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>Current API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}</p>
                    <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
                    {process.env.VERCEL_ENV && <p><strong>Vercel Environment:</strong> {process.env.VERCEL_ENV}</p>}
                </div>
            </CardContent>
        </Card>
    )
}