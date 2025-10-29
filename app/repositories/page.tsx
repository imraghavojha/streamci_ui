// app/repositories/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, GitBranch, CheckCircle, ArrowRight, XCircle } from "lucide-react"
import { RetroMenuBar } from "@/components/retro-menu-bar"
import { RetroFooter } from "@/components/retro-footer"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface Repository {
    name: string
    full_name: string
    private?: boolean
    language?: string
}

export default function RepositoriesPage() {
    const { user } = useUser()
    const router = useRouter()

    const [repositories, setRepositories] = useState<Repository[]>([])
    const [selectedRepos, setSelectedRepos] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [status, setStatus] = useState<"idle" | "valid" | "error">("idle") // simplified status
    const [message, setMessage] = useState<string>("") // added message state
    const [error, setError] = useState<string | null>(null) // keep original error state too

    useEffect(() => {
        if (user?.id) {
            fetchRepositories()
        }
    }, [user?.id])

    const fetchRepositories = async () => {
        try {
            setLoading(true)
            setError(null) // clear previous errors
            setMessage("") // clear previous messages
            setStatus("idle")

            const response = await fetch(`${API_URL}/api/repositories/${user?.id}`)
            const data = await response.json()

            if (response.ok && data.success) {
                setRepositories(data.repositories || [])
                const cleanSelected = (data.selected_repos || []).filter((repo: string) => repo && repo.trim() !== "")
                setSelectedRepos(cleanSelected)
            } else {
                setError(data.error || `failed to fetch repositories (status: ${response.status})`)
                setRepositories([]) // clear repos on error
                setSelectedRepos([])
            }
        } catch (err: any) {
            setError(`network error - check if backend is running (${err.message})`)
            setRepositories([])
            setSelectedRepos([])
        } finally {
            setLoading(false)
        }
    }

    const toggleRepository = (repoFullName: string) => {
        setSelectedRepos(prev =>
            prev.includes(repoFullName)
                ? prev.filter(name => name !== repoFullName)
                : [...prev, repoFullName]
        )
        // clear status/message when selection changes
        setStatus("idle")
        setMessage("")
    }

    const saveSelection = async () => {
        if (!user?.id) {
            setStatus("error")
            setMessage("❌ User not identified.")
            return
        }

        try {
            setSaving(true)
            setStatus("idle")
            setMessage("")

            const response = await fetch(`${API_URL}/api/repositories/${user?.id}/select`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    selected_repos: selectedRepos
                })
            })

            const data = await response.json()

            if (response.ok && data.success) {
                setStatus("valid")
                setMessage("✅ Selection saved! Redirecting...")

                // redirect after a short delay
                setTimeout(() => {
                    router.push("/dashboard?refresh=true") // add refresh param
                }, 800)
            } else {
                setStatus("error")
                setMessage(`❌ ${data.error || "failed to save selection"}`)
            }
        } catch (err: any) {
            setStatus("error")
            setMessage(`❌ network error: ${err.message}`)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <RetroMenuBar />
                <div className="flex-grow flex items-center justify-center pt-12 pb-12 px-4">
                    <div className="retro-panel w-full max-w-md">
                        <div className="panel-content text-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                            <p className="text-xl">Loading repositories...</p>
                        </div>
                    </div>
                </div>
                <RetroFooter />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col">
            <RetroMenuBar />

            <div className="flex-grow pt-12 pb-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="retro-panel">
                        <div className="panel-title-bar">
                            <GitBranch className="w-5 h-5 mr-2" />
                            <div className="panel-title">Select Repositories to Monitor</div>
                        </div>
                        <div className="panel-content">
                            <p className="mb-4">
                                Choose which repositories you want to track in your dashboard
                            </p>

                            <div className="space-y-4">

                        {error && !loading && (
                            <div className="border-2 border-[var(--color-fail)] bg-[var(--color-fail)]/10 px-4 py-3 flex items-center gap-2">
                                <XCircle className="w-4 h-4" style={{ color: 'var(--color-fail)' }} />
                                <span>{error}</span>
                                <button onClick={fetchRepositories} className="retro-btn ml-auto text-sm px-2 py-1">
                                    Retry
                                </button>
                            </div>
                        )}

                        {repositories.length === 0 && !error && !loading ? (
                            <div className="text-center py-8">
                                <p className="mb-4">No repositories found for your account.</p>
                                <button onClick={fetchRepositories} className="retro-btn">
                                    Retry Fetch
                                </button>
                            </div>
                        ) : repositories.length > 0 && !error ? (
                            <>
                                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                                    {repositories.map((repo) => (
                                        <div
                                            key={repo.full_name}
                                            className="flex items-center gap-3 p-3 border-2 border-[var(--border-color)] hover:bg-[var(--subtle-bg)] cursor-pointer transition-colors"
                                            onClick={() => toggleRepository(repo.full_name)}
                                        >
                                            <Checkbox
                                                id={`repo-${repo.full_name}`}
                                                checked={selectedRepos.includes(repo.full_name)}
                                                onCheckedChange={() => toggleRepository(repo.full_name)}
                                                aria-label={`select ${repo.full_name}`}
                                            />
                                            <label htmlFor={`repo-${repo.full_name}`} className="flex-1 cursor-pointer">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-bold">{repo.name}</span>
                                                    {repo.private && (
                                                        <span className="px-2 py-0.5 text-xs border-2 border-[var(--border-color)] bg-[var(--subtle-bg)]">
                                                            PRIVATE
                                                        </span>
                                                    )}
                                                    {repo.language && (
                                                        <span className="px-2 py-0.5 text-xs border-2 border-[var(--border-color)]">
                                                            {repo.language}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm">{repo.full_name}</p>
                                            </label>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4 border-t-2 border-[var(--border-color)] space-y-3">
                                    {status !== "idle" && message && (
                                        <div className={`flex items-center gap-2 p-3 border-2 ${
                                            status === "valid"
                                                ? "border-[var(--color-success)] bg-[var(--color-success)]/10"
                                                : "border-[var(--color-fail)] bg-[var(--color-fail)]/10"
                                        }`}>
                                            {status === "valid" ? (
                                                <CheckCircle className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
                                            ) : (
                                                <XCircle className="w-4 h-4" style={{ color: 'var(--color-fail)' }} />
                                            )}
                                            <span>{message}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-bold">
                                            {selectedRepos.length} of {repositories.length} selected
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => router.push("/dashboard")}
                                                disabled={saving}
                                                className="retro-btn"
                                            >
                                                Skip for now
                                            </button>
                                            <button
                                                onClick={saveSelection}
                                                disabled={saving || selectedRepos.length === 0 || status === 'valid'}
                                                className={`retro-btn retro-btn-primary flex items-center gap-2 ${
                                                    (saving || selectedRepos.length === 0 || status === 'valid') ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                            >
                                                {saving ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : status === 'valid' ? (
                                                    <>
                                                        <CheckCircle className="w-4 h-4" />
                                                        Saved
                                                    </>
                                                ) : (
                                                    <>
                                                        Save Selection
                                                        <ArrowRight className="w-4 h-4" />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <RetroFooter />
        </div>
    )
}