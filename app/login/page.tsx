"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Github } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-serif font-bold">StreamCI</span>
          </div>
          <CardTitle className="font-serif">Connect Your GitHub Account</CardTitle>
          <CardDescription>
            StreamCI needs access to your repositories to provide real-time analytics and insights for your CI/CD
            pipelines.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            size="lg"
            className="w-full flex items-center justify-center space-x-3 text-lg py-6"
            onClick={() => {
              // In a real app, this would initiate OAuth flow
              window.location.href = "/dashboard"
            }}
          >
            <Github className="w-5 h-5" />
            <span>Login with GitHub</span>
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            By connecting your GitHub account, you agree to our{" "}
            <Link href="#" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
