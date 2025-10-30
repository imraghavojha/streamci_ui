"use client"

import { useState, useEffect } from "react"
import { useUser, UserButton } from "@clerk/nextjs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Copy, ExternalLink, Webhook, Loader2, Play, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

export function WebhooksModern() {
    const { user } = useUser()

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
    const WEBHOOK_URL = user?.id ? `${API_URL}/api/webhooks/github/${user.id}` : `${API_URL}/api/webhooks/github/YOUR_USER_ID`

    const [webhookSecret, setWebhookSecret] = useState("")
    const [savedSecret, setSavedSecret] = useState("")
    const [copied, setCopied] = useState(false)
    const [secretCopied, setSecretCopied] = useState(false)
    const [showSecret, setShowSecret] = useState(false)
    const [saveLoading, setSaveLoading] = useState(false)
    const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
    const [testLoading, setTestLoading] = useState(false)
    const [testResult, setTestResult] = useState<{ type: 'success' | 'error', message: string } | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadWebhookSecret = async () => {
            if (!user?.id) return

            try {
                const response = await fetch(`${API_URL}/api/setup/webhook-secret/${user.id}`)
                const data = await response.json()

                if (data.success && data.webhookSecret) {
                    setWebhookSecret(data.webhookSecret)
                    setSavedSecret(data.webhookSecret)
                } else {
                    const randomSecret = generateSecureSecret()
                    setWebhookSecret(randomSecret)
                }
            } catch (error) {
                console.error('Failed to load webhook secret:', error)
                const randomSecret = generateSecureSecret()
                setWebhookSecret(randomSecret)
            } finally {
                setLoading(false)
            }
        }

        loadWebhookSecret()
    }, [user?.id, API_URL])

    const generateSecureSecret = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        let secret = ''
        for (let i = 0; i < 32; i++) {
            secret += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return secret
    }

    const copyToClipboard = async (text: string, setCopiedState: (value: boolean) => void) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedState(true)
            setTimeout(() => setCopiedState(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const regenerateSecret = () => {
        const newSecret = generateSecureSecret()
        setWebhookSecret(newSecret)
        setSaveStatus(null)
    }

    const saveWebhookSecret = async () => {
        if (!user?.id || !webhookSecret.trim()) {
            setSaveStatus({ type: 'error', message: 'User ID or webhook secret missing' })
            return
        }

        setSaveLoading(true)
        setSaveStatus(null)

        try {
            const response = await fetch(`${API_URL}/api/setup/webhook-secret`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    clerkUserId: user.id,
                    webhookSecret: webhookSecret
                })
            })

            const data = await response.json()

            if (data.success) {
                setSavedSecret(webhookSecret)
                setSaveStatus({ type: 'success', message: 'Webhook secret saved successfully!' })
            } else {
                setSaveStatus({ type: 'error', message: data.error || 'Failed to save webhook secret' })
            }
        } catch (error: any) {
            setSaveStatus({ type: 'error', message: `Network error: ${error.message}` })
        } finally {
            setSaveLoading(false)
        }
    }

    const hasUnsavedChanges = webhookSecret !== savedSecret

    const testWebhook = async (eventType: 'workflow-completed' | 'workflow-started' | 'push') => {
        setTestLoading(true)
        setTestResult(null)

        try {
            const endpoint = eventType === 'workflow-completed'
                ? '/api/test/webhook/workflow-completed?conclusion=success&repository=test-repo&branch=main'
                : eventType === 'workflow-started'
                ? '/api/test/webhook/workflow-started?repository=test-repo&branch=main'
                : '/api/test/webhook/push?repository=test-repo&branch=main'

            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            const data = await response.json()

            if (response.ok) {
                setTestResult({
                    type: 'success',
                    message: `Test successful! Check your dashboard for the event.`
                })
            } else {
                setTestResult({
                    type: 'error',
                    message: `Test failed: ${data.error || 'Unknown error'}`
                })
            }
        } catch (error: any) {
            setTestResult({
                type: 'error',
                message: `Network error: ${error.message}`
            })
        } finally {
            setTestLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <h1 className="text-2xl font-bold">GitHub Webhooks</h1>
                        </div>
                        <UserButton />
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    {/* Intro */}
                    <div className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-3">
                            <Webhook className="w-10 h-10 text-primary" />
                        </div>
                        <p className="text-muted-foreground">
                            Receive real-time notifications when workflows run
                        </p>
                    </div>

                    {/* Quick Setup Guide */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Setup</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-2">
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[var(--accent-color)] text-white flex items-center justify-center font-bold shrink-0">1</div>
                                    <p>Save your webhook secret below</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[var(--accent-color)] text-white flex items-center justify-center font-bold shrink-0">2</div>
                                    <p>Go to your GitHub repo → Settings → Webhooks → Add webhook</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[var(--accent-color)] text-white flex items-center justify-center font-bold shrink-0">3</div>
                                    <p>Paste the webhook URL and secret from below, select "Workflow runs" and "Pushes" events</p>
                                </div>
                            </div>
                            <div className="pt-2">
                                <a
                                    href="https://docs.github.com/en/webhooks-and-events/webhooks/creating-webhooks"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-bold underline inline-flex items-center"
                                    style={{ color: 'var(--accent-color)' }}
                                >
                                    View GitHub Webhook Docs
                                    <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Webhook URL */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Webhook URL</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    value={WEBHOOK_URL}
                                    readOnly
                                    className="flex-1 border-2 border-[var(--border-color)] bg-[var(--panel-bg)] font-mono text-sm"
                                />
                                <button
                                    onClick={() => copyToClipboard(WEBHOOK_URL, setCopied)}
                                    className=" flex items-center gap-2"
                                >
                                    {copied ? (
                                        <>
                                            <CheckCircle className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Copy
                                        </>
                                    )}
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Webhook Secret */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Webhook Secret</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {loading ? (
                                <div className="flex items-center justify-center gap-2 py-4">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <p>Loading...</p>
                                </div>
                            ) : (
                                <>
                                    {hasUnsavedChanges && (
                                        <div className="p-3 border-2 border-[var(--accent-color)] bg-[var(--accent-color)]/10">
                                            <p className="text-sm font-bold">
                                                Unsaved changes - click "Save Secret" to apply
                                            </p>
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <Input
                                            type={showSecret ? "text" : "password"}
                                            value={webhookSecret}
                                            onChange={(e) => {
                                                setWebhookSecret(e.target.value)
                                                setSaveStatus(null)
                                            }}
                                            disabled={saveLoading}
                                            className="flex-1 border-2 border-[var(--border-color)] bg-[var(--panel-bg)] font-mono text-sm"
                                        />
                                        <button
                                            onClick={() => setShowSecret(!showSecret)}
                                            className=""
                                        >
                                            {showSecret ? "Hide" : "Show"}
                                        </button>
                                        <button
                                            onClick={() => copyToClipboard(webhookSecret, setSecretCopied)}
                                            className=" flex items-center gap-2"
                                        >
                                            {secretCopied ? (
                                                <>
                                                    <CheckCircle className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-4 h-4" />
                                                    Copy
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={saveWebhookSecret}
                                            disabled={saveLoading || !hasUnsavedChanges}
                                            className={`Button Button-primary flex items-center gap-2 ${
                                                (saveLoading || !hasUnsavedChanges) ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                        >
                                            {saveLoading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4" />
                                                    Save Secret
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={regenerateSecret}
                                            disabled={saveLoading}
                                            className=" Button-secondary"
                                        >
                                            Generate New
                                        </button>
                                    </div>
                                    {saveStatus && (
                                        <div className={`flex items-center gap-2 p-3 border-2 ${
                                            saveStatus.type === 'success'
                                                ? "border-[var(--color-success)] bg-[var(--color-success)]/10"
                                                : "border-[var(--color-fail)] bg-[var(--color-fail)]/10"
                                        }`}>
                                            {saveStatus.type === 'success' ? (
                                                <CheckCircle className="w-5 h-5" style={{ color: 'var(--color-success)' }} />
                                            ) : (
                                                <XCircle className="w-5 h-5" style={{ color: 'var(--color-fail)' }} />
                                            )}
                                            <span>{saveStatus.message}</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Test Webhooks */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <Play className="w-4 h-4 inline mr-2" />
                                Test Your Webhooks
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm">
                                Simulate webhook events to test your integration
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <button
                                    onClick={() => testWebhook('workflow-completed')}
                                    disabled={testLoading}
                                    className=" Button-primary flex items-center justify-center gap-2 p-3"
                                >
                                    {testLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Play className="w-4 h-4" />
                                    )}
                                    <div className="text-center">
                                        <div className="font-bold">Workflow Complete</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => testWebhook('workflow-started')}
                                    disabled={testLoading}
                                    className=" Button-secondary flex items-center justify-center gap-2 p-3"
                                >
                                    {testLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Play className="w-4 h-4" />
                                    )}
                                    <div className="text-center">
                                        <div className="font-bold">Workflow Started</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => testWebhook('push')}
                                    disabled={testLoading}
                                    className=" flex items-center justify-center gap-2 p-3"
                                >
                                    {testLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Play className="w-4 h-4" />
                                    )}
                                    <div className="text-center">
                                        <div className="font-bold">Push Event</div>
                                    </div>
                                </button>
                            </div>

                            {testResult && (
                                <div className={`flex items-center gap-2 p-3 border-2 ${
                                    testResult.type === 'success'
                                        ? "border-[var(--color-success)] bg-[var(--color-success)]/10"
                                        : "border-[var(--color-fail)] bg-[var(--color-fail)]/10"
                                }`}>
                                    {testResult.type === 'success' ? (
                                        <CheckCircle className="w-5 h-5" style={{ color: 'var(--color-success)' }} />
                                    ) : (
                                        <XCircle className="w-5 h-5" style={{ color: 'var(--color-fail)' }} />
                                    )}
                                    <span>{testResult.message}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
