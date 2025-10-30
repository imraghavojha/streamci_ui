import type React from "react"
import type { Metadata } from "next"
import { VT323 } from "next/font/google"
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/contexts/theme-context'
import { ThemeWelcomeScreen } from '@/components/theme-welcome-screen'
import "./globals.css"

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-retro",
})

export const metadata: Metadata = {
  title: "StreamCI - Real-Time CI/CD Analytics",
  description:
    "Supercharge your workflow with predictive insights, intelligent alerting, and in-depth performance metrics for your CI/CD pipelines.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  if (!clerkPublishableKey) {
    return (
      <html lang="en" className={vt323.variable}>
        <body className="font-sans">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="retro-panel max-w-md">
              <div className="panel-title-bar">
                <div className="panel-title">Configuration Error</div>
              </div>
              <div className="panel-content p-5">
                <p className="mb-2">Missing Clerk configuration.</p>
                <p className="text-sm opacity-75">Please set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    )
  }

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/auth-redirect"
      afterSignUpUrl="/auth-redirect"
    >
      <html lang="en" className={vt323.variable}>
        <body className="font-sans">
          <ThemeProvider>
            {children}
            <ThemeWelcomeScreen />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}