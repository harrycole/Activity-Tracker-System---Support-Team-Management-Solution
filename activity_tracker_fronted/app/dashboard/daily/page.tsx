"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Loader2, User, Building, ArrowLeft, TrendingUp } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { fetchDailyActivities, type Activity } from "@/lib/activity-store"
import Link from "next/link"
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export default function DailyView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActivities()
  }, [currentDate])

  const loadActivities = async () => {
    setLoading(true)
    const dateStr = currentDate.toISOString().split("T")[0]
    try {
      const data = await fetchDailyActivities(dateStr)
      setActivities(data)
    } catch (error) {
      console.error("Error loading daily activities:", error)
    } finally {
      setLoading(false)
    }
  }

  const previousDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 1)
    setCurrentDate(newDate)
  }

  const nextDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 1)
    setCurrentDate(newDate)
  }

  const completedCount = activities.filter((a) => a.status === "done").length
  const pendingCount = activities.filter((a) => a.status === "pending").length
  const completionRate = activities.length > 0 ? Math.round((completedCount / activities.length) * 100) : 0

  const pieData = [
    { name: "Completed", value: completedCount, fill: "var(--color-chart-1)" },
    { name: "Pending", value: pendingCount, fill: "var(--color-chart-2)" },
  ]

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="flex items-center justify-center h-[calc(100vh-80px)]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading daily activities...</p>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-6 gap-2 hover-lift">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="mb-8">
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground">Daily View</h1>
            <p className="mt-2 text-lg text-muted-foreground">Activities and metrics for this day</p>
          </div>

          <Card className="border-border/30 mb-8">
            <CardContent className="flex items-center justify-between p-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={previousDay}
                className="rounded-full hover-lift"
                disabled={loading}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div className="text-center flex-1">
                <p className="text-2xl font-bold text-foreground">{formatDate(currentDate)}</p>
                <p className="mt-1 text-sm text-muted-foreground">{activities.length} activities logged</p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={nextDay}
                className="rounded-full hover-lift"
                disabled={loading}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>

          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <Card className="border-border/30 bg-gradient-to-br from-card to-card/50">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Activities</p>
                    <p className="mt-2 text-3xl font-bold text-foreground">{activities.length}</p>
                  </div>
                  <div className="rounded-full p-3 bg-primary/10 hover-lift">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/30 bg-gradient-to-br from-card to-card/50">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="mt-2 text-3xl font-bold text-primary">{completedCount}</p>
                  </div>
                  <div className="rounded-full p-3 bg-primary/10 hover-lift">
                    <span className="text-lg font-bold text-primary">✓</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/30 bg-gradient-to-br from-card to-card/50">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                    <p className="mt-2 text-3xl font-bold text-primary">{completionRate}%</p>
                  </div>
                  <div className="rounded-full p-3 bg-primary/10 hover-lift">
                    <span className="text-lg font-bold text-primary">{completionRate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            <Card className="border-border/30">
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
                <CardDescription>Completed vs pending activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/30">
              <CardHeader>
                <CardTitle>Timeline Overview</CardTitle>
                <CardDescription>Activity distribution by hour</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Completion</span>
                      <span className="text-sm font-bold text-primary">{completionRate}%</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-border/30">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Pending</span>
                      <span className="text-sm font-bold text-accent">{100 - completionRate}%</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-border/30">
                      <div
                        className="h-full rounded-full bg-accent transition-all"
                        style={{ width: `${100 - completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/30">
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>All activities in chronological order</CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No activities for this day</p>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div key={activity.activity_id} className="relative pb-4">
                      {index !== activities.length - 1 && (
                        <div className="absolute left-4 top-10 h-6 w-0.5 bg-border/30" />
                      )}

                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`h-8 w-8 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              activity.status === "done"
                                ? "bg-primary border-primary"
                                : "border-border/50 bg-background"
                            }`}
                          >
                            {activity.status === "done" && (
                              <svg
                                className="h-4 w-4 text-primary-foreground"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>

                        <Link href={`/dashboard/activity/${activity.activity_id}`} className="flex-1 min-w-0">
                          <div className="flex-1 p-3 rounded-lg border border-border/20 bg-card/50 hover:border-primary/30 hover:bg-card transition-all cursor-pointer">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground truncate">{activity.title}</p>

                                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                  <User className="h-3 w-3" />
                                  <span>{activity.creator?.name || "Unknown"}</span>
                                  <span>•</span>
                                  <span>{new Date(activity.created_at).toLocaleTimeString()}</span>
                                </div>

                                {activity.creator?.department && (
                                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                    <Building className="h-3 w-3" />
                                    <span>{activity.creator.department}</span>
                                  </div>
                                )}

                                {activity.description && (
                                  <div className="mt-2 text-sm text-foreground line-clamp-2">
                                    {activity.description}
                                  </div>
                                )}
                              </div>
                              <Badge
                                variant={activity.status === "done" ? "default" : "secondary"}
                                className="shrink-0"
                              >
                                {activity.status === "done" ? "Done" : "Pending"}
                              </Badge>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {activities.length > 0 && (
            <Card className="mt-8 border-border/30 border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="text-lg">Shift Handover Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="font-semibold text-foreground text-sm mb-2">✓ Completed</p>
                      <p className="text-lg font-bold text-primary">{completedCount}</p>
                      <p className="text-xs text-muted-foreground mt-1">Activities done</p>
                    </div>
                    <div className="p-4 rounded-lg bg-accent/5 border border-accent/10">
                      <p className="font-semibold text-foreground text-sm mb-2">→ Pending</p>
                      <p className="text-lg font-bold text-accent">{pendingCount}</p>
                      <p className="text-xs text-muted-foreground mt-1">Items for next shift</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
