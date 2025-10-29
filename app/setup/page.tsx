"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { CheckCircle, XCircle, Loader2, ExternalLink, Eye, EyeOff } from "lucide-react"
import { RetroMenuBar } from "@/components/retro-menu-bar"
import { RetroFooter } from "@/components/retro-footer"

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
        <div className="min-h-screen flex flex-col">
            <RetroMenuBar />

            <div className="flex-grow pt-12 pb-12 px-4">
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-4xl font-bold">Setup StreamCI</h1>
                        <p className="text-xl">
                            Connect your GitHub account to start monitoring workflows
                        </p>
                    </div>

                    <div className="retro-panel">
                        <div className="panel-title-bar">
                            <div className="panel-title">GitHub Personal Access Token</div>
                        </div>
                        <div className="panel-content space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="token" className="text-sm font-bold">
                                    Token
                                </label>
                                <div className="relative">
                                    <Input
                                        id="token"
                                        type={tokenVisible ? "text" : "password"}
                                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                                        value={token}
                                        onChange={(e) => setToken(e.target.value)}
                                        className="pr-10 border-2 border-[var(--border-color)] bg-[var(--panel-bg)] font-mono"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-[var(--subtle-bg)] transition-colors"
                                        onClick={() => setTokenVisible(!tokenVisible)}
                                    >
                                        {tokenVisible ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-sm">
                                    Need a token?{" "}
                                    <a
                                        href="https://github.com/settings/tokens/new?scopes=repo,workflow"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-bold underline inline-flex items-center"
                                        style={{ color: 'var(--accent-color)' }}
                                    >
                                        Create one here
                                        <ExternalLink className="w-3 h-3 ml-1" />
                                    </a>
                                </p>
                            </div>

                            <button
                                onClick={saveToken}
                                disabled={!token.trim() || loading || validating}
                                className={`retro-btn retro-btn-primary w-full flex items-center justify-center gap-2 ${
                                    (!token.trim() || loading || validating) ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : validating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Validating...
                                    </>
                                ) : (
                                    "Save Token"
                                )}
                            </button>

                            {status !== "idle" && (
                                <div className={`flex items-center gap-2 p-3 border-2 ${
                                    status === "valid"
                                        ? "border-[var(--color-success)] bg-[var(--color-success)]/10"
                                        : "border-[var(--color-fail)] bg-[var(--color-fail)]/10"
                                }`}>
                                    {status === "valid" ? (
                                        <CheckCircle className="w-5 h-5" style={{ color: 'var(--color-success)' }} />
                                    ) : (
                                        <XCircle className="w-5 h-5" style={{ color: 'var(--color-fail)' }} />
                                    )}
                                    <span>{message}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="retro-panel">
                        <div className="panel-title-bar">
                            <div className="panel-title">Instructions</div>
                        </div>
                        <div className="panel-content space-y-2">
                            <p>1. Click the link above to create a GitHub Personal Access Token</p>
                            <p>2. Select the following scopes:</p>
                            <ul className="list-disc list-inside pl-4">
                                <li><span className="px-2 py-0.5 bg-[var(--subtle-bg)] border-2 border-[var(--border-color)] font-mono text-sm">repo</span> - Full control of private repositories</li>
                                <li><span className="px-2 py-0.5 bg-[var(--subtle-bg)] border-2 border-[var(--border-color)] font-mono text-sm">workflow</span> - Update GitHub Action workflows</li>
                            </ul>
                            <p>3. Copy the generated token and paste it above</p>
                            <p>4. Click "Save Token" to complete setup</p>
                        </div>
                    </div>
                </div>
            </div>

            <RetroFooter />
        </div>
    )
}