"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, BarChart3, Bell, Zap, Github, TrendingUp, Activity, Terminal, Sun, Moon } from "lucide-react"
import Link from "next/link"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { ThemeSwitcher } from '@/components/theme-switcher'
import { useTheme } from '@/contexts/theme-context'

export function HomepageModern() {
  const { darkMode, toggleDarkMode } = useTheme()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-serif font-bold">StreamCI</span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeSwitcher />

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
            >
              {darkMode === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            <SignedIn>
              <UserButton />
            </SignedIn>

            <SignedOut>
              <Link href="/sign-in">
                <Button className="flex items-center space-x-2">
                  <Github className="w-4 h-4" />
                  <span>Sign In</span>
                </Button>
              </Link>
            </SignedOut>

            <SignedIn>
              <Link href="/dashboard">
                <Button className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-6">
            Real-Time CI/CD Monitoring
          </Badge>
          <h1 className="text-5xl font-serif font-bold mb-6 leading-tight">
            Monitor Your <span className="text-primary">GitHub Actions</span> Workflows
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A full-stack project for monitoring CI/CD pipelines with real-time analytics, pattern detection, and alert systems.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo">
              <Button size="lg" className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>View Live Demo</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <SignedOut>
              <Link href="/sign-in">
                <Button variant="outline" size="lg" className="flex items-center space-x-2">
                  <Github className="w-5 h-5" />
                  <span>Sign In with GitHub</span>
                </Button>
              </Link>
            </SignedOut>

            <SignedIn>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Go to Dashboard</span>
                </Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold mb-4">Core Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real-time monitoring and analytics for GitHub Actions workflows
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border">
              <CardHeader>
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Activity className="w-5 h-5 text-blue-500" />
                </div>
                <CardTitle className="font-serif">Real-Time Monitoring</CardTitle>
                <CardDescription>
                  Track pipeline status, build times, and workflow execution across your repositories in real-time.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <CardTitle className="font-serif">Analytics Dashboard</CardTitle>
                <CardDescription>
                  View success rates, build trends, and performance metrics with interactive charts and visualizations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Bell className="w-5 h-5 text-purple-500" />
                </div>
                <CardTitle className="font-serif">Alert System</CardTitle>
                <CardDescription>
                  Get notified about build failures, performance issues, and workflow anomalies as they happen.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold mb-4">Built With</h2>
            <p className="text-muted-foreground">
              Full-stack application demonstrating modern web technologies
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-border text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Terminal className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Next.js 15</h3>
                <p className="text-xs text-muted-foreground">React framework with App Router</p>
              </CardContent>
            </Card>

            <Card className="border-border text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-1">Spring Boot</h3>
                <p className="text-xs text-muted-foreground">Java backend with REST API</p>
              </CardContent>
            </Card>

            <Card className="border-border text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-1">PostgreSQL</h3>
                <p className="text-xs text-muted-foreground">Database with Supabase</p>
              </CardContent>
            </Card>

            <Card className="border-border text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Github className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-1">GitHub API</h3>
                <p className="text-xs text-muted-foreground">Webhooks & Actions integration</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Additional: TypeScript, Tailwind CSS, Clerk Auth, WebSockets, Recharts
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">
              Simple workflow monitoring in three steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-foreground">
                1
              </div>
              <h3 className="font-semibold mb-2">Connect GitHub</h3>
              <p className="text-sm text-muted-foreground">
                Link your GitHub account and select repositories to monitor
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-foreground">
                2
              </div>
              <h3 className="font-semibold mb-2">Receive Events</h3>
              <p className="text-sm text-muted-foreground">
                GitHub Actions sends webhook events to StreamCI backend
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-foreground">
                3
              </div>
              <h3 className="font-semibold mb-2">View Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Monitor builds, analyze trends, and get alerts in real-time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl font-serif font-bold mb-6">
            See It In Action
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Try the interactive demo to see how StreamCI monitors and analyzes CI/CD workflows
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo">
              <Button size="lg" className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>View Live Demo</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <SignedOut>
              <Link href="/sign-up">
                <Button variant="outline" size="lg" className="flex items-center space-x-2">
                  <Github className="w-5 h-5" />
                  <span>Get Started</span>
                </Button>
              </Link>
            </SignedOut>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-serif font-bold">StreamCI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            A full-stack CI/CD monitoring project built with Next.js and Spring Boot
          </p>
        </div>
      </footer>
    </div>
  )
}
