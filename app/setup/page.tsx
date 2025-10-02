"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, ExternalLink, Eye, EyeOff, Bug, Zap } from "lucide-react"

// Debug component for setup page
function SetupDebugPanel({ user, token }: any) {
    const [showDebug, setShowDebug] = useState(false)

    return (
        <Card className="mb-4 border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Bug className="w-4 h-4" />
                        Setup Debug Information
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDebug(!showDebug)}
                    >
                        {showDebug ? 'Hide' : 'Show'} Debug
                    </Button>
                </div>
            </CardHeader>
            {showDebug && (
                <CardContent className="text-xs space-y-4">
                    <div>
                        <h4 className="font-semibold text-green-700">Environment:</h4>
                        <div className="bg-gray-100 p-2 rounded mt-1 font-mono">
                            <div>API URL: {process.env.NEXT_PUBLIC_API_URL || "❌ NOT SET"}</div>
                            <div>Node ENV: {process.env.NODE_ENV}</div>
                            <div>Vercel ENV: {process.env.VERCEL_ENV || "not in vercel"}</div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-blue-700">User State:</h4>
                        <div className="bg-gray-100 p-2 rounded mt-1">
                            <div>User ID: {user?.id || "❌ NO USER"}</div>
                            <div>Email: {user?.primaryEmailAddress?.emailAddress || "N/A"}</div>
                            <div>Token Length: {token.length} characters</div>
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    )
}

export default function SetupPage() {
    const { user } = useUser()
    const router = useRouter()

    const [token, setToken] = useState("")
    const [loading, setLoading] = useState(false)
    const [validating, setValidating] = useState(false)
    const [tokenVisible, setTokenVisible] = useState(false)
    const [status, setStatus] = useState<"idle" | "valid" | "invalid" | "error">("idle")
    const [message, setMessage] = useState("")
    const [debugLog, setDebugLog] = useState<string[]>([])

    // Add to debug log
    const addDebugLog = (message: string) => {
        const timestamp = new Date().toISOString()
        const logMessage = `[${timestamp}] ${message}`
        console.log("🔧", logMessage)
        setDebugLog(prev => [...prev, logMessage].slice(-10)) // Keep last 10 messages
    }

    const testConnection = async () => {
        addDebugLog("Testing connection to backend...")
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
            addDebugLog(`Using API URL: ${API_URL}`)

            const response = await fetch(`${API_URL}/health`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            })

            addDebugLog(`Health check response: ${response.status} ${response.statusText}`)

            if (response.ok) {
                const data = await response.json()
                addDebugLog(`Health check data: ${JSON.stringify(data)}`)
                setStatus("valid")
                setMessage("✅ Backend connection successful!")
            } else {
                addDebugLog(`Health check failed with status: ${response.status}`)
                setStatus("error")
                setMessage(`❌ Backend returned ${response.status}`)
            }
        } catch (error: any) {
            addDebugLog(`Health check error: ${error.message}`)
            setStatus("error")
            setMessage(`❌ Connection failed: ${error.message}`)
        }
    }

    const saveToken = async () => {
        addDebugLog(`Save token clicked - User ID: ${user?.id}, Token length: ${token.length}`)

        if (!user?.id || !token.trim()) {
            addDebugLog("Validation failed - missing user or token")
            setStatus("error")
            setMessage("❌ User ID or token missing")
            return
        }

        setLoading(true)
        setStatus("idle")

        try {
            const response = await fetch("http://localhost:8080/api/setup/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(requestBody)
            })

            addDebugLog(`Save token response: ${response.status} ${response.statusText}`)
            addDebugLog(`Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`)

            const responseText = await response.text()
            addDebugLog(`Response body (text): ${responseText}`)

            let data
            try {
                data = JSON.parse(responseText)
                addDebugLog(`Parsed response data: ${JSON.stringify(data)}`)
            } catch (e) {
                addDebugLog(`Failed to parse JSON response: ${e}`)
                throw new Error(`Invalid JSON response: ${responseText}`)
            }

            if (data.success) {
                addDebugLog("Token saved successfully, now validating...")
                setStatus("valid")
                setMessage("✅ Token saved successfully!")
                // now validate the token
                await validateToken()
            } else {
                addDebugLog(`Token save failed: ${data.error}`)
                setStatus("error")
                setMessage(`❌ ${data.error || "failed to save token"}`)
            }
        } catch (error: any) {
            addDebugLog(`Save token error: ${error.message}`)
            setStatus("error")
            setMessage(`❌ Network error: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    const validateToken = async () => {
        if (!user?.id) {
            addDebugLog("Cannot validate token - no user ID")
            return
        }

        addDebugLog("Starting token validation...")
        setValidating(true)

        try {
            const response = await fetch("http://localhost:8080/api/setup/validate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    clerkUserId: user.id
                })
            })

            addDebugLog(`Validate response: ${response.status} ${response.statusText}`)

            const data = await response.json()
            addDebugLog(`Validate response data: ${JSON.stringify(data)}`)

            if (data.success) {
                if (data.valid) {
                    addDebugLog("Token validation successful")
                    setStatus("valid")
                    setMessage("✅ Token is valid! Redirecting to repositories...")

                    // Redirect after a short delay
                    setTimeout(() => {
                        addDebugLog("Redirecting to repositories page...")
                        router.push('/repositories')
                    }, 2000)
                } else {
                    addDebugLog("Token is invalid")
                    setStatus("invalid")
                    setMessage("❌ Token is invalid or expired")
                }
            } else {
                addDebugLog(`Validation failed: ${data.error}`)
                setStatus("error")
                setMessage(`❌ Validation error: ${data.error}`)
            }
        } catch (error: any) {
            addDebugLog(`Validation error: ${error.message}`)
            setStatus("error")
            setMessage(`❌ Validation failed: ${error.message}`)
        } finally {
            setValidating(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                {/* DEBUG PANEL */}
                <SetupDebugPanel user={user} token={token} />

                <Card className="border-border">
                    <CardHeader>
                        <CardTitle className="font-serif text-center">
                            Setup GitHub Integration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Connection Test */}
                        <div className="space-y-2">
                            <Button
                                onClick={testConnection}
                                variant="outline"
                                size="sm"
                                className="w-full"
                            >
                                <Zap className="w-3 h-3 mr-1" />
                                Test Backend Connection
                            </Button>
                        </div>

                        {/* GitHub Token Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                GitHub Personal Access Token
                            </label>
                            <div className="relative">
                                <Input
                                    type={tokenVisible ? "text" : "password"}
                                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3"
                                    onClick={() => setTokenVisible(!tokenVisible)}
                                >
                                    {tokenVisible ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Need a token?{" "}
                                <a
                                    href="https://github.com/settings/tokens/new?scopes=repo,actions:read"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline inline-flex items-center"
                                >
                                    Create one here
                                    <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                            </p>
                        </div>

                        {/* Save Button */}
                        <Button
                            onClick={saveToken}
                            disabled={!token.trim() || loading || validating}
                            className="w-full"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : validating ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            {loading
                                ? "Saving..."
                                : validating
                                    ? "Validating..."
                                    : "Save Token"}
                        </Button>

                        {/* Status Display */}
                        {status !== "idle" && (
                            <div className="flex items-center space-x-2 p-3 rounded-lg bg-muted">
                                {status === "valid" ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-500" />
                                )}
                                <span className="text-sm">{message}</span>
                            </div>
                        )}

                        {/* Debug Log */}
                        {debugLog.length > 0 && (
                            <Card className="border-gray-200">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs">Debug Log</CardTitle>
                                </CardHeader>
                                <CardContent className="text-xs">
                                    <div className="bg-gray-900 text-green-400 p-2 rounded font-mono max-h-40 overflow-y-auto">
                                        {debugLog.map((log, index) => (
                                            <div key={index} className="mb-1">{log}</div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Instructions */}
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <h4 className="font-medium text-foreground">Required Token Permissions:</h4>
                            <ul className="space-y-1 text-xs">
                                <li className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs">repo</Badge>
                                    <span>Access to repositories</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs">actions:read</Badge>
                                    <span>Read GitHub Actions</span>
                                </li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}