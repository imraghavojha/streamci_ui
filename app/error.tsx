'use client'

import { useEffect } from 'react'
import { BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        {/* StreamCI branding */}
        <Link
          href="/"
          className="flex items-center justify-center gap-2 mb-8 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-serif font-bold">StreamCI</span>
        </Link>

        {/* Error panel */}
        <div className="retro-panel">
          <div className="panel-title-bar">
            <div className="panel-title">Application Error</div>
          </div>
          <div className="panel-content p-5">
            <p className="mb-4">Something went wrong. Please try again.</p>

            {error.digest && (
              <p className="text-sm opacity-75 mb-4">Error ID: {error.digest}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => reset()}
                className="retro-btn retro-btn-primary"
              >
                Try again
              </button>
              <Link href="/" className="retro-btn">
                Go home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
