"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Loader2, User, Building, ArrowLeft, TrendingUp, Calendar, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { fetchDailyActivities, type Activity } from "@/lib/activity-store"
import Link from "next/link"
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"

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

  // Calculate statistics
  const completedCount = activities.filter((a) => a.status === "done").length
  const pendingCount = activities.filter((a) => a.status === "pending").length
  const completionRate = activities.length > 0 ? Math.round((completedCount / activities.length) * 100) : 0

  // Get activities with updates
  const activitiesWithUpdates = activities.filter(a => a.updates && a.updates.length > 0).length
  const activitiesWithoutUpdates = activities.length - activitiesWithUpdates

  // Get unique departments
  const uniqueDepartments = Array.from(new Set(
    activities
      .map(a => a.creator?.department)
      .filter(dept => dept)
  ))

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // Get activities by time period (morning, afternoon, evening)
  const getActivitiesByTimePeriod = () => {
    const morning = activities.filter(a => {
      const hour = new Date(a.created_at).getHours()
      return hour >= 6 && hour < 12
    }).length
    
    const afternoon = activities.filter(a => {
      const hour = new Date(a.created_at).getHours()
      return hour >= 12 && hour < 18
    }).length
    
    const evening = activities.filter(a => {
      const hour = new Date(a.created_at).getHours()
      return hour >= 18 || hour < 6
    }).length
    
    return { morning, afternoon, evening }
  }

  const timePeriodData = getActivitiesByTimePeriod()

  // Pie chart data
  const statusPieData = [
    { name: "Completed", value: completedCount, color: "#10b981" },
    { name: "Pending", value: pendingCount, color: "#f59e0b" },
  ]

  const timePieData = [
    { name: "Morning", value: timePeriodData.morning, color: "#3b82f6" },
    { name: "Afternoon", value: timePeriodData.afternoon, color: "#8b5cf6" },
    { name: "Evening", value: timePeriodData.evening, color: "#ef4444" },
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

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-6 gap-2 hover-lift">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="mb-8">
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground">Daily Activity Report</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Activities and metrics for {formatDate(currentDate)}
            </p>
          </div>

          {/* Date Navigation */}
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
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <p className="text-2xl font-bold text-foreground">{formatDate(currentDate)}</p>
                </div>
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    {completedCount} completed
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    {pendingCount} pending
                  </span>
                  <span>•</span>
                  <span>{activities.length} total activities</span>
                </div>
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

          {/* Statistics Cards */}
          <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/30 bg-gradient-to-br from-card to-card/50">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Activities</p>
                    <p className="mt-2 text-3xl font-bold text-foreground">{activities.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">{uniqueDepartments.length} departments</p>
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
                    <p className="mt-2 text-3xl font-bold text-green-600">{completedCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {completionRate}% completion rate
                    </p>
                  </div>
                  <div className="rounded-full p-3 bg-green-500/10 hover-lift">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/30 bg-gradient-to-br from-card to-card/50">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <p className="mt-2 text-3xl font-bold text-amber-500">{pendingCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activitiesWithUpdates} with updates
                    </p>
                  </div>
                  <div className="rounded-full p-3 bg-amber-500/10 hover-lift">
                    <AlertCircle className="h-6 w-6 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/30 bg-gradient-to-br from-card to-card/50">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Departments</p>
                    <p className="mt-2 text-3xl font-bold text-blue-500">{uniqueDepartments.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activitiesWithoutUpdates} without updates
                    </p>
                  </div>
                  <div className="rounded-full p-3 bg-blue-500/10 hover-lift">
                    <Building className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            <Card className="border-border/30">
              <CardHeader>
                <CardTitle>Activity Status</CardTitle>
                <CardDescription>Completed vs pending activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} activities`, 'Count']}
                        contentStyle={{ 
                          backgroundColor: "var(--color-card)", 
                          border: "1px solid var(--color-border)",
                          borderRadius: "8px"
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/30">
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
                <CardDescription>Distribution by time of day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={timePieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {timePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} activities`, 'Count']}
                        contentStyle={{ 
                          backgroundColor: "var(--color-card)", 
                          border: "1px solid var(--color-border)",
                          borderRadius: "8px"
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Timeline */}
          <Card className="border-border/30 mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Activity Timeline</CardTitle>
                  <CardDescription>All activities in chronological order</CardDescription>
                </div>
                <Badge variant="outline" className="ml-2">
                  {activities.length} activities
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">No activities for this day</p>
                  <p className="text-sm text-muted-foreground mt-2">Try selecting a different date</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div key={activity.activity_id} className="relative pb-6 last:pb-0">
                      {index !== activities.length - 1 && (
                        <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border/30" />
                      )}

                      <div className="flex gap-4">
                        <div className="flex flex-col items-center pt-1">
                          <div
                            className={`h-10 w-10 rounded-full border-4 flex items-center justify-center shrink-0 ${
                              activity.status === "done"
                                ? "bg-green-100 border-green-300"
                                : "bg-amber-100 border-amber-300"
                            }`}
                          >
                            {activity.status === "done" ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <Clock className="h-5 w-5 text-amber-600" />
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground mt-2">
                            {formatTime(activity.created_at)}
                          </span>
                        </div>

                        <Link 
                          href={`/dashboard/activity/${activity.activity_id}`} 
                          className="flex-1 min-w-0 group"
                        >
                          <div className="p-4 rounded-lg border border-border/20 bg-card/50 group-hover:border-primary/30 group-hover:bg-card transition-all cursor-pointer">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <p className="font-semibold text-foreground truncate">
                                    {activity.title}
                                  </p>
                                  <Badge
                                    variant={activity.status === "done" ? "default" : "secondary"}
                                    className="shrink-0"
                                  >
                                    {activity.status === "done" ? "Done" : "Pending"}
                                  </Badge>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                  <div className="flex items-center gap-1">
                                    <User className="h-3.5 w-3.5" />
                                    <span>{activity.creator?.name || "Unknown"}</span>
                                  </div>
                                  {activity.creator?.department && (
                                    <>
                                      <div className="h-1 w-1 rounded-full bg-border" />
                                      <div className="flex items-center gap-1">
                                        <Building className="h-3.5 w-3.5" />
                                        <span>{activity.creator.department}</span>
                                      </div>
                                    </>
                                  )}
                                </div>

                                {activity.description && (
                                  <div className="text-sm text-foreground line-clamp-2 mb-3">
                                    {activity.description}
                                  </div>
                                )}

                                {activity.updates && activity.updates.length > 0 && (
                                  <div className="text-xs text-muted-foreground">
                                    <span className="font-medium">Latest update: </span>
                                    <span className="italic">
                                      "{activity.updates[activity.updates.length - 1].remark || "No remark"}"
                                    </span>
                                  </div>
                                )}
                              </div>
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

          {/* Shift Handover Summary - Improved */}
          {activities.length > 0 && (
            <Card className="border-border/30 border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Shift Handover Summary</CardTitle>
                    <CardDescription>Key information for the next shift</CardDescription>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <p className="font-semibold text-foreground text-sm">Completed</p>
                      </div>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-400">{completedCount}</p>
                      <p className="text-xs text-muted-foreground mt-1">Ready for handover</p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                        <p className="font-semibold text-foreground text-sm">Pending</p>
                      </div>
                      <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{pendingCount}</p>
                      <p className="text-xs text-muted-foreground mt-1">Needs follow-up</p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Building className="h-5 w-5 text-blue-600" />
                        <p className="font-semibold text-foreground text-sm">Departments</p>
                      </div>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{uniqueDepartments.length}</p>
                      <p className="text-xs text-muted-foreground mt-1">Involved teams</p>
                    </div>
                  </div>

                  {pendingCount > 0 && (
                    <div className="p-4 rounded-lg bg-background border">
                      <h4 className="font-semibold text-foreground mb-3">Pending Items Requiring Attention:</h4>
                      <div className="space-y-2">
                        {activities
                          .filter(a => a.status === 'pending')
                          .slice(0, 5) // Show only first 5
                          .map(activity => (
                            <div key={activity.activity_id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                <span className="text-sm font-medium">{activity.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">{activity.creator?.department}</span>
                                <Badge variant="outline" size="sm">
                                  {activity.updates?.length || 0} updates
                                </Badge>
                              </div>
                            </div>
                          ))}
                        {pendingCount > 5 && (
                          <p className="text-xs text-muted-foreground text-center pt-2">
                            +{pendingCount - 5} more pending activities
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}