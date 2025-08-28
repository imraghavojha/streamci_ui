import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, BarChart3, Bell, Zap, Github, Star, Users, TrendingUp } from "lucide-react"
import Link from "next/link"
import { SignedIn, SignedOut } from "@clerk/nextjs"

export default function LandingPage() {
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

          {/* conditional login/dashboard button */}
          <SignedOut>
            <Link href="/sign-in">
              <Button className="flex items-center space-x-2">
                <Github className="w-4 h-4" />
                <span>Login with GitHub</span>
              </Button>
            </Link>
          </SignedOut>

          <SignedIn>
            <Link href="/dashboard">
              <Button className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Go to Dashboard</span>
              </Button>
            </Link>
          </SignedIn>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-6">
            Real-Time CI/CD Analytics
          </Badge>
          <h1 className="text-5xl font-serif font-bold mb-6 leading-tight">
            Real-Time CI/CD Analytics to <span className="text-primary">Supercharge Your Workflow</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            StreamCI provides predictive insights, intelligent alerting, and in-depth performance metrics for your CI/CD
            pipelines.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignedOut>
              <Link href="/sign-in">
                <Button size="lg" className="flex items-center space-x-2">
                  <Github className="w-5 h-5" />
                  <span>Get Started with GitHub</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </SignedOut>

            <SignedIn>
              <Link href="/dashboard">
                <Button size="lg" className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>View Your Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </SignedIn>

            <Button variant="outline" size="lg">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold mb-4">Everything you need to optimize your pipelines</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From real-time monitoring to predictive analytics, StreamCI gives you the insights you need to build better software faster.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border">
              <CardHeader>
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <CardTitle className="font-serif">Predictive Analytics</CardTitle>
                <CardDescription>
                  AI-powered insights to predict build failures before they happen and optimize your development workflow.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Bell className="w-5 h-5 text-green-500" />
                </div>
                <CardTitle className="font-serif">Smart Alerts</CardTitle>
                <CardDescription>
                  Get notified about critical issues with intelligent alerting that learns from your patterns and reduces noise.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5 text-purple-500" />
                </div>
                <CardTitle className="font-serif">Real-time Monitoring</CardTitle>
                <CardDescription>
                  Monitor your CI/CD pipelines in real-time with live dashboards, performance metrics, and health scores.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-muted-foreground">Uptime Guarantee</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50%</div>
              <div className="text-muted-foreground">Faster Build Times</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">85%</div>
              <div className="text-muted-foreground">Fewer Failed Builds</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold mb-4">Trusted by development teams worldwide</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "StreamCI helped us reduce our build failure rate by 60% and identify bottlenecks we never knew existed.
                  The UI is intuitive and the insights are actionable."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Sarah Chen</p>
                    <p className="text-xs text-muted-foreground">Lead Engineer, TechCorp</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "The predictive analytics are game-changing. We can now prevent issues before they impact our deployment pipeline.
                  The UI is intuitive and the insights are actionable."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Emily Johnson</p>
                    <p className="text-xs text-muted-foreground">Senior Developer, InnovateLab</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-serif font-bold">StreamCI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Real-time CI/CD analytics platform for modern development teams.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Status
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    API Reference
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 StreamCI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}