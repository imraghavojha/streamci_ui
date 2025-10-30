"use client"

import { useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function AuthRedirectPage() {
    const { user, isLoaded } = useUser()
    const router = useRouter()

    useEffect(() => {
        const checkTokenAndRedirect = async () => {
            if (!isLoaded || !user?.id) return

            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
                const response = await fetch(`${API_URL}/api/setup/webhook-secret/${user.id}`)
                const data = await response.json()

                // Check if user has a GitHub token by trying to get their webhook secret
                // If they have no webhook secret, they likely haven't set up their token yet
                const tokenResponse = await fetch(`${API_URL}/api/dashboard/summary/${user.id}`)

                if (tokenResponse.ok) {
                    // User has a token, go to dashboard
                    router.push('/dashboard')
                } else {
                    // User doesn't have a token, go to setup
                    router.push('/setup')
                }
            } catch (error) {
                console.error('Error checking token status:', error)
                // Default to setup page if we can't determine
                router.push('/setup')
            }
        }

        checkTokenAndRedirect()
    }, [isLoaded, user, router])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-lg">Setting up your account...</p>
            </div>
        </div>
    )
}
