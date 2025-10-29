import Link from "next/link"
import { SignedIn, SignedOut } from "@clerk/nextjs"
import { RetroMenuBar } from "@/components/retro-menu-bar"
import { RetroFooter } from "@/components/retro-footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <RetroMenuBar />

      {/* Desktop area */}
      <div className="flex-grow flex flex-col items-center justify-center px-6 pb-12 pt-20">
        {/* Welcome Panel */}
        <div className="retro-panel w-full max-w-[640px] mb-6">
          <div className="panel-title-bar">
            <div className="panel-title">Welcome to StreamCI</div>
          </div>
          <div className="panel-content p-5">
            <h1 className="text-4xl font-bold mb-4">A new class of CI/CD.</h1>
            <p className="mb-2">A simple, powerful CI/CD system with a familiar, classic interface.</p>
            <p className="mb-6">Monitor your pipelines, check build status, and get live alerts.</p>

            <div className="flex flex-wrap gap-4">
              <SignedOut>
                <Link href="/sign-in" className="retro-btn retro-btn-primary">
                  Login with GitHub
                </Link>
                <Link href="/demo" className="retro-btn">
                  View Demo
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="retro-btn retro-btn-primary">
                  Go to Dashboard
                </Link>
                <Link href="/demo" className="retro-btn">
                  View Demo
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>

        {/* Features Panel */}
        <div className="retro-panel w-full max-w-[640px]">
          <div className="panel-title-bar">
            <div className="panel-title">System Features</div>
          </div>
          <div className="panel-content p-5">
            <ul className="list-disc list-inside space-y-2 animate-stagger">
              <li className="hover:translate-x-1 transition-transform">Live Build Status: See what's running.</li>
              <li className="hover:translate-x-1 transition-transform">Real-time Alerts: Get notified of failures.</li>
              <li className="hover:translate-x-1 transition-transform">Clean Build History: Review your logs.</li>
              <li className="hover:translate-x-1 transition-transform">Pattern Detection: AI-powered insights.</li>
              <li className="hover:translate-x-1 transition-transform">Analytics Dashboard: Track performance.</li>
              <li className="hover:translate-x-1 transition-transform">Aesthetic UI: A dashboard you'll actually...</li>
              <li className="hover:translate-x-1 transition-transform">...want to look at.</li>
            </ul>
          </div>
        </div>
      </div>

      <RetroFooter />
    </div>
  )
}
