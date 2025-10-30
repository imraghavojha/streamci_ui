"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Input } from "@/components/ui/input"
import { CheckCircle, XCircle, Copy, ExternalLink, Webhook, Activity, Loader2, Play, Save } from "lucide-react"
import { RetroMenuBar } from "@/components/retro-menu-bar"
import { RetroFooter } from "@/components/retro-footer"

export default function WebhooksPage() {
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
        // Load existing webhook secret from backend
        const loadWebhookSecret = async () => {
            if (!user?.id) return

            try {
                const response = await fetch(`${API_URL}/api/setup/webhook-secret/${user.id}`)
                const data = await response.json()

                if (data.success && data.webhookSecret) {
                    setWebhookSecret(data.webhookSecret)
                    setSavedSecret(data.webhookSecret)
                } else {
                    // Generate a new secret if none exists
                    const randomSecret = generateSecureSecret()
                    setWebhookSecret(randomSecret)
                }
            } catch (error) {
                console.error('Failed to load webhook secret:', error)
                // Generate a new secret on error
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
                    message: `Test webhook sent successfully! ${data.message || ''}`
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
        <div className="min-h-screen flex flex-col">
            <RetroMenuBar />

            <div className="flex-grow pt-12 pb-12 px-4">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-3">
                            <Webhook className="w-10 h-10" style={{ color: 'var(--accent-color)' }} />
                            <h1 className="text-4xl font-bold">GitHub Webhooks</h1>
                        </div>
                        <p className="text-xl">
                            Configure GitHub webhooks to receive real-time build notifications
                        </p>
                    </div>

                    {/* Webhook URL */}
                    <div className="retro-panel">
                        <div className="panel-title-bar">
                            <div className="panel-title">Webhook URL</div>
                        </div>
                        <div className="panel-content space-y-3">
                            <p className="text-sm">
                                Add this URL to your GitHub repository's webhook settings
                            </p>
                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    value={WEBHOOK_URL}
                                    readOnly
                                    className="flex-1 border-2 border-[var(--border-color)] bg-[var(--panel-bg)] font-mono"
                                />
                                <button
                                    onClick={() => copyToClipboard(WEBHOOK_URL, setCopied)}
                                    className="retro-btn flex items-center gap-2"
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
                        </div>
                    </div>

                    {/* Webhook Secret */}
                    <div className="retro-panel">
                        <div className="panel-title-bar">
                            <div className="panel-title">Webhook Secret</div>
                        </div>
                        <div className="panel-content space-y-3">
                            {loading ? (
                                <div className="flex items-center justify-center gap-2 py-4">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <p>Loading webhook secret...</p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-sm">
                                        Use this secret to secure your webhook endpoint. Add it to your GitHub webhook configuration.
                                    </p>
                                    {hasUnsavedChanges && (
                                        <div className="p-3 border-2 border-[var(--accent-color)] bg-[var(--accent-color)]/10">
                                            <p className="text-sm font-bold">
                                                You have unsaved changes. Click "Save Secret" to apply them.
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
                                            className="flex-1 border-2 border-[var(--border-color)] bg-[var(--panel-bg)] font-mono"
                                        />
                                        <button
                                            onClick={() => setShowSecret(!showSecret)}
                                            className="retro-btn"
                                        >
                                            {showSecret ? "Hide" : "Show"}
                                        </button>
                                        <button
                                            onClick={() => copyToClipboard(webhookSecret, setSecretCopied)}
                                            className="retro-btn flex items-center gap-2"
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
                                            className={`retro-btn retro-btn-primary flex items-center gap-2 ${
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
                                            className="retro-btn retro-btn-secondary"
                                        >
                                            Generate New Secret
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
                        </div>
                    </div>

                    {/* Setup Instructions */}
                    <div className="retro-panel">
                        <div className="panel-title-bar">
                            <div className="panel-title">Setup Instructions</div>
                        </div>
                        <div className="panel-content space-y-4">
                            <div className="space-y-3">
                                <div className="font-bold text-lg">Step 1: Save Your Webhook Secret</div>
                                <div className="pl-4 space-y-2">
                                    <p>Click the "Save Secret" button above to store your webhook secret securely in the backend.</p>
                                    <p className="text-sm opacity-75">
                                        Your webhook secret is stored per-user and used to verify webhook requests from GitHub.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="font-bold text-lg">Step 2: Configure GitHub Webhook</div>
                                <div className="pl-4 space-y-2">
                                    <p>1. Go to your GitHub repository</p>
                                    <p>2. Navigate to <span className="px-2 py-0.5 bg-[var(--subtle-bg)] border-2 border-[var(--border-color)] font-mono text-sm">Settings</span> → <span className="px-2 py-0.5 bg-[var(--subtle-bg)] border-2 border-[var(--border-color)] font-mono text-sm">Webhooks</span></p>
                                    <p>3. Click <span className="px-2 py-0.5 bg-[var(--subtle-bg)] border-2 border-[var(--border-color)] font-mono text-sm">Add webhook</span></p>
                                    <p>4. Configure the webhook:</p>
                                    <ul className="list-disc list-inside pl-4 space-y-1">
                                        <li>
                                            <span className="font-bold">Payload URL:</span>{" "}
                                            <span className="px-2 py-0.5 bg-[var(--subtle-bg)] border-2 border-[var(--border-color)] font-mono text-sm break-all">
                                                {WEBHOOK_URL}
                                            </span>
                                        </li>
                                        <li>
                                            <span className="font-bold">Content type:</span>{" "}
                                            <span className="px-2 py-0.5 bg-[var(--subtle-bg)] border-2 border-[var(--border-color)] font-mono text-sm">
                                                application/json
                                            </span>
                                        </li>
                                        <li>
                                            <span className="font-bold">Secret:</span> Paste your webhook secret (copy from above)
                                        </li>
                                        <li>
                                            <span className="font-bold">Events:</span> Select "Workflow runs" and "Pushes"
                                        </li>
                                    </ul>
                                    <p>5. Click <span className="px-2 py-0.5 bg-[var(--subtle-bg)] border-2 border-[var(--border-color)] font-mono text-sm">Add webhook</span></p>
                                    <p className="pt-2">
                                        <a
                                            href="https://docs.github.com/en/webhooks-and-events/webhooks/creating-webhooks"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-bold underline inline-flex items-center"
                                            style={{ color: 'var(--accent-color)' }}
                                        >
                                            View GitHub Webhook Documentation
                                            <ExternalLink className="w-3 h-3 ml-1" />
                                        </a>
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="font-bold text-lg">Step 3: Test Your Webhook</div>
                                <div className="pl-4 space-y-2">
                                    <p>After setting up the webhook in GitHub:</p>
                                    <ul className="list-disc list-inside pl-4 space-y-1">
                                        <li>Use the test buttons below to simulate webhook events</li>
                                        <li>Or push a commit to your repository</li>
                                        <li>Or manually trigger a workflow run</li>
                                        <li>Check your GitHub webhook settings for delivery status</li>
                                        <li>Monitor your StreamCI dashboard for real-time updates</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Webhook Events */}
                    <div className="retro-panel">
                        <div className="panel-title-bar">
                            <div className="panel-title">
                                <Activity className="w-4 h-4 inline mr-2" />
                                Supported Webhook Events
                            </div>
                        </div>
                        <div className="panel-content">
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 p-3 border-2 border-[var(--border-color)] bg-[var(--subtle-bg)]">
                                    <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: 'var(--color-success)' }}></div>
                                    <div className="flex-1">
                                        <div className="font-bold">Workflow Run Events</div>
                                        <div className="text-sm opacity-75">
                                            Triggered when GitHub Actions workflows are queued, started, or completed
                                        </div>
                                        <div className="text-sm font-mono mt-1">
                                            workflow_run (queued, in_progress, completed)
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 border-2 border-[var(--border-color)] bg-[var(--subtle-bg)]">
                                    <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: 'var(--accent-color)' }}></div>
                                    <div className="flex-1">
                                        <div className="font-bold">Push Events</div>
                                        <div className="text-sm opacity-75">
                                            Triggered when commits are pushed to a repository
                                        </div>
                                        <div className="text-sm font-mono mt-1">
                                            push
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Test Webhooks */}
                    <div className="retro-panel">
                        <div className="panel-title-bar">
                            <div className="panel-title">
                                <Play className="w-4 h-4 inline mr-2" />
                                Test Webhooks
                            </div>
                        </div>
                        <div className="panel-content space-y-4">
                            <p className="text-sm">
                                Test your webhook integration by simulating different GitHub events. These test events will be processed by your backend and appear in your dashboard.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    onClick={() => testWebhook('workflow-completed')}
                                    disabled={testLoading}
                                    className="retro-btn retro-btn-primary flex items-center justify-center gap-2 p-4"
                                >
                                    {testLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Play className="w-4 h-4" />
                                    )}
                                    <div className="text-left">
                                        <div className="font-bold">Workflow Completed</div>
                                        <div className="text-xs opacity-75">Success event</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => testWebhook('workflow-started')}
                                    disabled={testLoading}
                                    className="retro-btn retro-btn-secondary flex items-center justify-center gap-2 p-4"
                                >
                                    {testLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Play className="w-4 h-4" />
                                    )}
                                    <div className="text-left">
                                        <div className="font-bold">Workflow Started</div>
                                        <div className="text-xs opacity-75">In progress event</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => testWebhook('push')}
                                    disabled={testLoading}
                                    className="retro-btn flex items-center justify-center gap-2 p-4"
                                >
                                    {testLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Play className="w-4 h-4" />
                                    )}
                                    <div className="text-left">
                                        <div className="font-bold">Push Event</div>
                                        <div className="text-xs opacity-75">Commit pushed</div>
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
                        </div>
                    </div>

                    {/* Troubleshooting */}
                    <div className="retro-panel">
                        <div className="panel-title-bar">
                            <div className="panel-title">Troubleshooting</div>
                        </div>
                        <div className="panel-content space-y-2">
                            <p className="font-bold">Webhook not receiving events?</p>
                            <ul className="list-disc list-inside pl-4 space-y-1">
                                <li>Verify the webhook URL is correct and accessible</li>
                                <li>Check that the webhook secret matches in both GitHub and backend</li>
                                <li>Ensure your backend has the GITHUB_WEBHOOK_SECRET environment variable set</li>
                                <li>Check GitHub's webhook delivery logs for error messages</li>
                                <li>Verify SSL/TLS certificates are valid (for HTTPS endpoints)</li>
                                <li>Check your backend logs for webhook processing errors</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <RetroFooter />
        </div>
    )
}
