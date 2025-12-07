"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Badge } from "@/components/ui/badge"
import { Plus, ArrowRight, Calendar, BarChart3, Users } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { getActivities, updateActivityStatus } from "@/lib/activity-store"
import type { Activity } from "@/lib/activity-store"

export default function Dashboard() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [filter, setFilter] = useState<"all" | "done" | "pending">("all")

  useEffect(() => {
    setActivities(getActivities())
  }, [])

  const filteredActivities = activities.filter((activity) => filter === "all" || activity.status === filter)

  const toggleActivityStatus = (id: string) => {
    if (!user) return
    const activity = activities.find((a) => a.id === id)
    if (!activity) return

    const newStatus = activity.status === "done" ? "pending" : "done"
    const updated = updateActivityStatus(id, newStatus, activity.remark, user.id, user.name, user.department)
    if (updated) {
      setActivities(getActivities())
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          {/* Dashboard Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="mt-2 text-muted-foreground">Manage and track team activities</p>
            </div>
            <Link href="/dashboard/create">
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                New Activity
              </Button>
            </Link>
          </div>

          {/* Quick Navigation */}
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <Link href="/dashboard/daily">
              <Card className="border-border/50 cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="flex items-center gap-4 pt-6">
                  <Calendar className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Daily View</p>
                    <p className="text-sm text-muted-foreground">See today's activities</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/reporting">
              <Card className="border-border/50 cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="flex items-center gap-4 pt-6">
                  <BarChart3 className="h-8 w-8 text-accent" />
                  <div>
                    <p className="font-semibold text-foreground">Reports</p>
                    <p className="text-sm text-muted-foreground">Analyze metrics</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/team">
              <Card className="border-border/50 cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="flex items-center gap-4 pt-6">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Team</p>
                    <p className="text-sm text-muted-foreground">View team members</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Filter Section */}
          <div className="mb-8 flex gap-3">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className="rounded-full"
            >
              All Activities
            </Button>
            <Button
              variant={filter === "done" ? "default" : "outline"}
              onClick={() => setFilter("done")}
              className="rounded-full"
            >
              Done
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              onClick={() => setFilter("pending")}
              className="rounded-full"
            >
              Pending
            </Button>
          </div>

          {/* Activities List */}
          <div className="space-y-4 mb-12">
            {filteredActivities.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">No activities found</p>
                </CardContent>
              </Card>
            ) : (
              filteredActivities.map((activity) => (
                <Card key={activity.id} className="border-border/50 transition-colors hover:bg-card/80">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleActivityStatus(activity.id)}
                          className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            activity.status === "done"
                              ? "bg-primary border-primary"
                              : "border-border hover:border-primary"
                          }`}
                        >
                          {activity.status === "done" && (
                            <svg
                              className="h-3 w-3 text-primary-foreground"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <div className="flex-1">
                          <h3
                            className={`font-semibold ${activity.status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}
                          >
                            {activity.title}
                          </h3>
                          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span>{activity.createdByName}</span>
                            <span>{new Date(activity.createdAt).toLocaleString()}</span>
                            {activity.remark && <span>{activity.remark}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={activity.status === "done" ? "default" : "secondary"}>
                        {activity.status === "done" ? "Done" : "Pending"}
                      </Badge>
                      <Link href={`/dashboard/activity/${activity.id}`}>
                        <Button variant="ghost" size="icon">
                          <ArrowRight className="h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Analytics Section */}
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Total Activities</CardTitle>
                <CardDescription>All tracked activities</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{activities.length}</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Completed</CardTitle>
                <CardDescription>Done activities</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-accent">{activities.filter((a) => a.status === "done").length}</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Pending</CardTitle>
                <CardDescription>Activities in progress</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-500">
                  {activities.filter((a) => a.status === "pending").length}
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
