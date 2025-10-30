// app/repositories/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" // ensure input is imported if needed, otherwise remove
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, GitBranch, CheckCircle, ArrowRight, XCircle } from "lucide-react" // added xcircle
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface Repository {
    name: string
    full_name: string
    private?: boolean
    language?: string
}

export function RepositoriesModern() {
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
            <div className="min-h-screen bg-background p-4">
                <div className="max-w-4xl mx-auto pt-12">
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="ml-2">loading repositories...</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="max-w-4xl mx-auto pt-12">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GitBranch className="w-5 h-5" />
                            Select Repositories to Monitor
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            choose which repositories you want to track in your dashboard
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">

                        {error && !loading && ( // show fetch error only when not loading
                            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm flex items-center gap-2">
                                <XCircle className="w-4 h-4" />
                                <span>{error}</span>
                                <Button variant="link" size="sm" onClick={fetchRepositories} className="ml-auto p-0 h-auto text-red-800">
                                    retry
                                </Button>
                            </div>
                        )}

                        {repositories.length === 0 && !error && !loading ? (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">no repositories found for your account.</p>
                                <Button variant="outline" onClick={fetchRepositories} className="mt-2">
                                    retry fetch
                                </Button>
                            </div>
                        ) : repositories.length > 0 && !error ? ( // only show list if no fetch error
                            <>
                                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                                    {repositories.map((repo) => (
                                        <div
                                            key={repo.full_name}
                                            className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                            onClick={() => toggleRepository(repo.full_name)}
                                        >
                                            <Checkbox
                                                id={`repo-${repo.full_name}`} // add id for label association
                                                checked={selectedRepos.includes(repo.full_name)}
                                                onCheckedChange={() => toggleRepository(repo.full_name)}
                                                aria-label={`select ${repo.full_name}`}
                                            />
                                            <label htmlFor={`repo-${repo.full_name}`} className="flex-1 cursor-pointer">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-medium">{repo.name}</span>
                                                    {repo.private && <Badge variant="secondary" className="text-xs">private</Badge>}
                                                    {repo.language && (
                                                        <Badge variant="outline" className="text-xs">{repo.language}</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">{repo.full_name}</p>
                                            </label>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4 border-t space-y-3">
                                    {status !== "idle" && message && ( // show saving status/message
                                        <div className={`flex items-center space-x-2 p-3 rounded-lg text-sm ${status === "valid" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
                                            }`}>
                                            {status === "valid" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                            <span>{message}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-muted-foreground">
                                            {selectedRepos.length} of {repositories.length} selected
                                        </div>

                                        <div className="flex gap-2">
                                            <Button variant="outline" onClick={() => router.push("/dashboard")} disabled={saving}>
                                                skip for now
                                            </Button>
                                            <Button
                                                onClick={saveSelection}
                                                disabled={saving || selectedRepos.length === 0 || status === 'valid'} // disable if saving or already valid
                                            >
                                                {saving ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        saving...
                                                    </>
                                                ) : status === 'valid' ? (
                                                    <>
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        saved
                                                    </>
                                                ) : (
                                                    <>
                                                        save selection
                                                        <ArrowRight className="w-4 h-4 ml-2" />
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : null /* handles case where error exists and no repos */}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}