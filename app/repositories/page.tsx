"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, GitBranch, CheckCircle, ArrowRight } from "lucide-react"

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
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (user?.id) {
            fetchRepositories()
        }
    }, [user?.id])

    const fetchRepositories = async () => {
        try {
            setLoading(true)
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
            const response = await fetch(`${API_URL}/api/repositories/${user?.id}`)
            const data = await response.json()

            if (data.success) {
                setRepositories(data.repositories || [])
                // fix: filter out empty strings and clean the selected repos
                const cleanSelected = (data.selected_repos || []).filter((repo: string) => repo.trim() !== "")
                setSelectedRepos(cleanSelected)
                setError(null)
            } else {
                setError(data.error || "failed to fetch repositories")
            }
        } catch (err) {
            setError("network error - check if backend is running")
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
    }

    const saveSelection = async () => {
        try {
            setSaving(true)
            const response = await fetch(`${API_URL}/api/repositories/${user?.id}/select`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    selected_repos: selectedRepos
                })
            })

            const data = await response.json()

            if (data.success) {
                router.push("/dashboard")
            } else {
                setError(data.error || "failed to save selection")
            }
        } catch (err) {
            setError("network error")
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
                            choose which repositories you want to track in your dashboard (use full names like "owner/repo")
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        {repositories.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">no repositories found</p>
                                <Button variant="outline" onClick={fetchRepositories} className="mt-2">
                                    retry
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3">
                                    {repositories.map((repo) => (
                                        <div
                                            key={repo.full_name}
                                            className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                                            onClick={() => toggleRepository(repo.full_name)}
                                        >
                                            <Checkbox
                                                checked={selectedRepos.includes(repo.full_name)}
                                                onCheckedChange={() => toggleRepository(repo.full_name)}
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{repo.name}</span>
                                                    {repo.private && <Badge variant="secondary">private</Badge>}
                                                    {repo.language && (
                                                        <Badge variant="outline">{repo.language}</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">{repo.full_name}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t">
                                    <div className="text-sm text-muted-foreground">
                                        {selectedRepos.length} of {repositories.length} repositories selected
                                    </div>

                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={() => router.push("/dashboard")}>
                                            skip for now
                                        </Button>
                                        <Button
                                            onClick={saveSelection}
                                            disabled={saving || selectedRepos.length === 0}
                                        >
                                            {saving ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    saving...
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
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}