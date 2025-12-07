"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { getActivitiesByDate } from "@/lib/activity-store"
import type { Activity } from "@/lib/activity-store"

export default function DailyView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    const dateStr = currentDate.toISOString().split("T")[0]
    setActivities(getActivitiesByDate(dateStr))
  }, [currentDate])

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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Daily Activity Overview</h1>
            <p className="mt-2 text-muted-foreground">View all activities and updates for a specific day</p>
          </div>

          {/* Date Navigation */}
          <div className="mb-8 flex items-center justify-between rounded-lg border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
            <Button variant="outline" size="icon" onClick={previousDay} className="rounded-full bg-transparent">
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{formatDate(currentDate)}</p>
              <p className="mt-1 text-sm text-muted-foreground">{activities.length} activities logged</p>
            </div>

            <Button variant="outline" size="icon" onClick={nextDay} className="rounded-full bg-transparent">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Statistics */}
          <div className="mb-8 grid gap-6 md:grid-cols-3">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{activities.length}</p>
                <p className="mt-2 text-xs text-muted-foreground">for {formatDate(currentDate)}</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-accent">{completedCount}</p>
                <p className="mt-2 text-xs text-muted-foreground">{completionRate}% completion rate</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Pending Handover</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-500">{pendingCount}</p>
                <p className="mt-2 text-xs text-muted-foreground">requires attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Activities Timeline */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>All activities and updates for this day in chronological order</CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No activities for this day</p>
              ) : (
                <div className="space-y-6">
                  {activities.map((activity, index) => (
                    <div key={activity.id} className="relative pb-6">
                      {index !== activities.length - 1 && (
                        <div className="absolute left-3 top-10 h-6 w-0.5 bg-border" />
                      )}

                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`h-7 w-7 rounded-full border-2 flex items-center justify-center ${
                              activity.status === "done" ? "bg-primary border-primary" : "border-border bg-background"
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

                        <div className="flex-1 pt-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-foreground">{activity.title}</p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {activity.createdByName} • {new Date(activity.createdAt).toLocaleTimeString()}
                              </p>
                              <p className="mt-2 rounded-lg bg-secondary/30 p-3 text-sm text-foreground">
                                <span className="font-medium">Personnel: </span>
                                {activity.createdByName} ({activity.createdByDepartment})
                              </p>
                              {activity.description && (
                                <p className="mt-2 text-sm text-foreground">{activity.description}</p>
                              )}
                              {activity.remark && (
                                <p className="mt-2 border-l-2 border-accent pl-3 text-sm italic text-muted-foreground">
                                  "{activity.remark}"
                                </p>
                              )}
                            </div>
                            <Badge
                              variant={activity.status === "done" ? "default" : "secondary"}
                              className="ml-4 shrink-0"
                            >
                              {activity.status === "done" ? "Done" : "Pending"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Handover Notes */}
          {activities.length > 0 && (
            <Card className="mt-8 border-border/50 border-accent/30 bg-accent/5">
              <CardHeader>
                <CardTitle className="text-lg">Handover Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-accent" />
                    <div>
                      <p className="font-medium text-foreground">Pending Items for Next Shift:</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {pendingCount} activities require attention from the incoming shift.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <div>
                      <p className="font-medium text-foreground">Completed Successfully:</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {completedCount} activities completed with {completionRate}% overall completion rate.
                      </p>
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
