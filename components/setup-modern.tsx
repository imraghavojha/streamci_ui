"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2, ExternalLink, Eye, EyeOff } from "lucide-react"

export function SetupModern() {
    const { user } = useUser()
    const router = useRouter()

    const [token, setToken] = useState("")
    const [loading, setLoading] = useState(false)
    const [validating, setValidating] = useState(false)
    const [tokenVisible, setTokenVisible] = useState(false)
    const [status, setStatus] = useState<"idle" | "valid" | "invalid" | "error">("idle")
    const [message, setMessage] = useState("")

    const saveToken = async () => {
        if (!user?.id || !token.trim()) {
            setStatus("error")
            setMessage("❌ User ID or token missing")
            return
        }

        setLoading(true)
        setStatus("idle")

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

            const response = await fetch(`${API_URL}/api/setup/token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    clerkUserId: user.id,
                    token: token
                })
            })

            const data = await response.json()

            if (data.success) {
                setStatus("valid")
                setMessage("✅ Token saved successfully!")

                // Now validate the token
                await validateToken()
            } else {
                setStatus("error")
                setMessage(`❌ ${data.error || "Failed to save token"}`)
            }
        } catch (error: any) {
            setStatus("error")
            setMessage(`❌ Network error: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    const validateToken = async () => {
        if (!user?.id) {
            return
        }

        setValidating(true)

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

            const response = await fetch(`${API_URL}/api/setup/validate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    clerkUserId: user.id
                })
            })

            const data = await response.json()

            if (data.success && data.valid) {
                setStatus("valid")
                setMessage("✅ Token is valid! Redirecting to dashboard...")

                setTimeout(() => {
                    router.push("/dashboard")
                }, 2000)
            } else {
                setStatus("invalid")
                setMessage(`❌ Token validation failed: ${data.error || "Invalid token"}`)
            }
        } catch (error: any) {
            setStatus("error")
            setMessage(`❌ Validation error: ${error.message}`)
        } finally {
            setValidating(false)
        }
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">Setup StreamCI</h1>
                    <p className="text-muted-foreground">
                        Connect your GitHub account to start monitoring workflows
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>GitHub Personal Access Token</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="token" className="text-sm font-medium">
                                Token
                            </label>
                            <div className="relative">
                                <Input
                                    id="token"
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
                                    href="https://github.com/settings/tokens/new?scopes=repo,workflow"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline inline-flex items-center"
                                >
                                    Create one here
                                    <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                            </p>
                        </div>

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
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Instructions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p>1. Click the link above to create a GitHub Personal Access Token</p>
                        <p>2. Select the following scopes:</p>
                        <ul className="list-disc list-inside pl-4">
                            <li><code>repo</code> - Full control of private repositories</li>
                            <li><code>workflow</code> - Update GitHub Action workflows</li>
                        </ul>
                        <p>3. Copy the generated token and paste it above</p>
                        <p>4. Click "Save Token" to complete setup</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}