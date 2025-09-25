"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, ExternalLink, Eye, EyeOff } from "lucide-react"

export default function SetupPage() {
    const { user } = useUser()
    const router = useRouter()

    const [token, setToken] = useState("")
    const [loading, setLoading] = useState(false)
    const [validating, setValidating] = useState(false)
    const [tokenVisible, setTokenVisible] = useState(false)
    const [status, setStatus] = useState<"idle" | "valid" | "invalid" | "error">("idle")
    const [message, setMessage] = useState("")

    const saveToken = async () => {
        console.log("saveToken clicked", { userId: user?.id, tokenLength: token.length })

        if (!user?.id || !token.trim()) {
            console.log("validation failed - missing user or token")
            return
        }

        setLoading(true)
        setStatus("idle")

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
            const response = await fetch(`${API_URL}/api/setup/token`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clerkUserId: user.id,
                    token: token.trim()
                })
            })

            const data = await response.json()

            if (data.success) {
                // now validate the token
                await validateToken()
            } else {
                setStatus("error")
                setMessage(data.error || "failed to save token")
            }
        } catch (error) {
            setStatus("error")
            setMessage("network error - is backend running?")
        } finally {
            setLoading(false)
        }
    }

    const validateToken = async () => {
        if (!user?.id) return

        setValidating(true)

        try {
            const response = await fetch(`${API_URL}/api/setup/validate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clerkUserId: user.id
                })
            })

            const data = await response.json()

            if (data.success) {
                if (data.valid) {
                    setStatus("valid")
                    setMessage("token is valid! redirecting to repository selection...")
                    setTimeout(() => router.push("/repositories"), 2000)
                } else {
                    setStatus("invalid")
                    setMessage("token is invalid - check scopes and permissions")
                }
            } else {
                setStatus("error")
                setMessage(data.error || "validation failed")
            }
        } catch (error) {
            setStatus("error")
            setMessage("validation error")
        } finally {
            setValidating(false)
        }
    }

    const getStatusIcon = () => {
        switch (status) {
            case "valid": return <CheckCircle className="w-5 h-5 text-green-500" />
            case "invalid": return <XCircle className="w-5 h-5 text-red-500" />
            case "error": return <XCircle className="w-5 h-5 text-red-500" />
            default: return null
        }
    }

    const getStatusColor = () => {
        switch (status) {
            case "valid": return "text-green-600"
            case "invalid": return "text-red-600"
            case "error": return "text-red-600"
            default: return "text-gray-600"
        }
    }

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="max-w-2xl mx-auto pt-12">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Connect Your GitHub
                            <Badge variant="outline">Required</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {/* instructions */}
                        <div className="space-y-4">
                            <h3 className="font-medium">Create a Personal Access Token</h3>
                            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                                <p>1. Go to GitHub Settings → Developer settings → Personal access tokens</p>
                                <p>2. Click "Generate new token" → "Generate new token (classic)"</p>
                                <p>3. Select these scopes:</p>
                                <div className="ml-4 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-xs">repo</Badge>
                                        <span>Full repository access</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-xs">workflow</Badge>
                                        <span>GitHub Actions access</span>
                                    </div>
                                </div>
                                <p>4. Copy the generated token</p>
                                <a
                                    href="https://github.com/settings/personal-access-tokens/new"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                                >
                                    Open GitHub Token Settings <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>

                        {/* token input */}
                        <div className="space-y-3">
                            <label htmlFor="token" className="text-sm font-medium">
                                GitHub Personal Access Token
                            </label>
                            <div className="relative">
                                <Input
                                    id="token"
                                    type={tokenVisible ? "text" : "password"}
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3"
                                    onClick={() => setTokenVisible(!tokenVisible)}
                                >
                                    {tokenVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>

                        {/* status message */}
                        {message && (
                            <div className={`flex items-center gap-2 text-sm ${getStatusColor()}`}>
                                {getStatusIcon()}
                                <span>{message}</span>
                            </div>
                        )}

                        {/* save button */}
                        <Button
                            onClick={saveToken}
                            disabled={loading || validating || !token.trim()}
                            className="w-full"
                        >
                            {loading || validating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {validating ? "Validating..." : "Saving..."}
                                </>
                            ) : (
                                "Save & Validate Token"
                            )}
                        </Button>

                        <p className="text-xs text-muted-foreground">
                            Your token is encrypted and stored securely. We never store your GitHub data permanently.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}