"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { CheckCircle2, TrendingUp, Users, Calendar } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mb-16 text-center">
          <h1 className="text-balance text-5xl font-bold tracking-tight text-foreground lg:text-6xl">
            Track Your Team's Activities
          </h1>
          <p className="mt-6 text-xl leading-8 text-muted-foreground">
            Manage daily activities, monitor progress, and optimize team handovers with our modern activity tracking
            system.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/login">
              <Button size="lg" className="px-8">
                Get Started
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-20">
          <div className="mb-12">
            <h2 className="text-balance text-3xl font-bold text-foreground">Everything you need</h2>
            <p className="mt-4 text-lg text-muted-foreground">Comprehensive tools for team activity management</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CheckCircle2 className="h-8 w-8 text-primary" />
                <CardTitle className="mt-4">Activity Logging</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Effortlessly log and track daily activities with detailed notes and remarks.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <Users className="h-8 w-8 text-accent" />
                <CardTitle className="mt-4">Team Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage team members, view bio details, and track who updated each activity.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <Calendar className="h-8 w-8 text-primary" />
                <CardTitle className="mt-4">Daily Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  See all activities and updates for each day with timestamps and personnel info.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-accent" />
                <CardTitle className="mt-4">Analytics & Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Generate custom reports and analyze activity histories over any duration.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
