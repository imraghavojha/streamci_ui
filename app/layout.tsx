import type React from "react"
import type { Metadata } from "next"
import { VT323 } from "next/font/google"
import { ClerkProvider } from '@clerk/nextjs'
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
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <html lang="en" className={vt323.variable}>
        <body className="font-sans">{children}</body>
      </html>
    </ClerkProvider>
  )
}