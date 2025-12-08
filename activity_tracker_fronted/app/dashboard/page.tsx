"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  ArrowRight,
  Calendar,
  BarChart3,
  Users,
  Loader2,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  Home,
  FileText,
  Settings,
} from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { fetchActivities, type Activity as ActivityType } from "@/lib/activity-store"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { DashboardDrawer } from "@/components/dashboard-drawer"
import { DashboardHeader } from "@/components/dashboard-header"
import { useRouter } from "next/navigation"

const ITEMS_PER_PAGE = 5

export default function Dashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [activities, setActivities] = useState<ActivityType[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    loadActivities()
    // Check for dark mode preference
    if (localStorage.getItem("theme") === "dark" || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const loadActivities = async () => {
    setLoading(true)
    try {
      const data = await fetchActivities()
      setActivities(data)
    } catch (error) {
      console.error("Failed to load activities:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    if (!darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Calendar, label: "Daily View", href: "/dashboard/daily" },
    { icon: BarChart3, label: "Reports", href: "/dashboard/reporting" },
    { icon: Users, label: "Team", href: "/team" },
    { icon: FileText, label: "Documents", href: "/documents" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ]

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-white dark:bg-background">
          <main className="flex items-center justify-center h-screen">
            <div className="flex flex-col items-center gap-4 fade-in">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  const recentActivities = activities.slice(0, ITEMS_PER_PAGE)
  const completedCount = activities.filter((a) => a.status === "done").length
  const pendingCount = activities.filter((a) => a.status === "pending").length
  const completionRate = activities.length > 0 ? Math.round((completedCount / activities.length) * 100) : 0

  const activityTrendData = [
    { date: "Mon", completed: 5, pending: 3, total: 8 },
    { date: "Tue", completed: 7, pending: 2, total: 9 },
    { date: "Wed", completed: 6, pending: 4, total: 10 },
    { date: "Thu", completed: 8, pending: 1, total: 9 },
    { date: "Fri", completed: 9, pending: 2, total: 11 },
    { date: "Sat", completed: 4, pending: 5, total: 9 },
    { date: "Sun", completed: completedCount, pending: pendingCount, total: activities.length },
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white dark:bg-background">
        <DashboardDrawer
          open={drawerOpen}
          darkMode={darkMode}
          navItems={navItems}
          onClose={() => setDrawerOpen(false)}
          onLogout={handleLogout}
        />

        {/* Main Content - Fixed margin for desktop */}
        <div className="min-h-screen lg:ml-72 bg-white dark:bg-background">
          <DashboardHeader 
            onMenuClick={() => setDrawerOpen(true)}
            darkMode={darkMode}
            user={user}
            onToggleDarkMode={toggleDarkMode}
          />

          <main className="px-6 py-8 lg:px-8">
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="slide-up">
                  <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground">
                    Welcome back, {user?.name?.split(' ')[0] || 'User'}
                  </h1>
                  <p className="mt-2 text-lg text-muted-foreground">
                    Here's what's happening today
                  </p>
                </div>
                
                <Link href="/dashboard/create">
                  <Button className="btn-oval px-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-200 slide-up cursor-pointer">
                    <Plus className="h-5 w-5 mr-2" />
                    New Activity
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-border/30 bg-white dark:bg-card card-hover">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Activities</p>
                      <p className="mt-2 text-3xl font-bold text-foreground">{activities.length}</p>
                    </div>
                    <div className="rounded-full p-3 bg-primary/10 icon-scale">
                      <Activity className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/30 bg-white dark:bg-card card-hover">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completed</p>
                      <p className="mt-2 text-3xl font-bold text-primary">{completedCount}</p>
                    </div>
                    <div className="rounded-full p-3 bg-primary/10 icon-scale">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/30 bg-white dark:bg-card card-hover">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending</p>
                      <p className="mt-2 text-3xl font-bold text-accent">{pendingCount}</p>
                    </div>
                    <div className="rounded-full p-3 bg-accent/10 icon-scale">
                      <Clock className="h-6 w-6 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/30 bg-white dark:bg-card card-hover">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                      <p className="mt-2 text-3xl font-bold text-primary">{completionRate}%</p>
                    </div>
                    <div className="rounded-full p-3 bg-primary/10 icon-scale">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              {/* Improved Line Chart */}
              <Card className="border-border/30 bg-white dark:bg-card lg:col-span-1 card-hover">
                <CardHeader>
                  <CardTitle className="text-lg">Weekly Activity Trend</CardTitle>
                  <CardDescription>Completed vs pending activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={activityTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                        <XAxis 
                          dataKey="date" 
                          stroke="var(--color-muted-foreground)" 
                          tick={{ fill: 'var(--color-muted-foreground)' }}
                        />
                        <YAxis 
                          stroke="var(--color-muted-foreground)" 
                          tick={{ fill: 'var(--color-muted-foreground)' }}
                        />
                        <Tooltip
                          contentStyle={{ 
                            backgroundColor: "var(--color-card)", 
                            border: "1px solid var(--color-border)",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                          }}
                          labelStyle={{ color: "var(--color-foreground)", fontWeight: 600 }}
                          wrapperStyle={{ 
                            transition: "opacity 0.2s ease, transform 0.2s ease" 
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="completed"
                          stroke="var(--color-chart-1)"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6, className: "icon-scale" }}
                          name="Completed"
                        />
                        <Line
                          type="monotone"
                          dataKey="pending"
                          stroke="var(--color-chart-2)"
                          strokeWidth={3}
                          strokeDasharray="5 5"
                          dot={{ r: 4 }}
                          activeDot={{ r: 6, className: "icon-scale" }}
                          name="Pending"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Status Distribution */}
              <Card className="border-border/30 bg-white dark:bg-card lg:col-span-1 card-hover">
                <CardHeader>
                  <CardTitle className="text-lg">Activity Distribution</CardTitle>
                  <CardDescription>Current status breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">Completed</p>
                        <p className="text-sm font-bold text-foreground">{completedCount}</p>
                      </div>
                      <div className="h-2 w-full rounded-full bg-border/30">
                        <div
                          className="h-full rounded-full progress-animate"
                          style={{
                            width: `${activities.length > 0 ? (completedCount / activities.length) * 100 : 0}%`,
                            backgroundColor: "var(--color-chart-1)",
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">Pending</p>
                        <p className="text-sm font-bold text-foreground">{pendingCount}</p>
                      </div>
                      <div className="h-2 w-full rounded-full bg-border/30">
                        <div
                          className="h-full rounded-full progress-animate"
                          style={{
                            width: `${activities.length > 0 ? (pendingCount / activities.length) * 100 : 0}%`,
                            backgroundColor: "var(--color-chart-2)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <div className="mb-8">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Recent Activities</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Latest updates and status</p>
                </div>
                {activities.length > ITEMS_PER_PAGE && (
                  <Link href="/dashboard/daily" className="cursor-pointer">
                    <Button className="btn-oval px-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer">
                      View All
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>

              <div className="flex flex-col gap-4">
                {recentActivities.length === 0 ? (
                  <Card className="border-border/30 bg-white dark:bg-card card-hover">
                    <CardContent className="flex items-center justify-center py-20">
                      <p className="text-muted-foreground">No activities yet. Create your first one!</p>
                    </CardContent>
                  </Card>
                ) : (
                  recentActivities.map((activity) => (
                    <Link 
                      key={activity.activity_id} 
                      href={`/dashboard/activity/${activity.activity_id}`} 
                      className="cursor-pointer"
                    >
                      <Card className="border-border/30 bg-white dark:bg-card cursor-pointer card-hover hover:border-primary/30">
                        <CardContent className="flex items-center justify-between p-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="truncate font-semibold text-foreground">{activity.title}</h3>
                            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{activity.creator?.name || "Unknown"}</span>
                              <span>•</span>
                              <span>{new Date(activity.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 ml-4">
                            <Badge 
                              variant={activity.status === "done" ? "default" : "secondary"}
                              className={`btn-oval ${
                                activity.status === "done" 
                                  ? "bg-gradient-to-r from-primary to-primary/80 text-white border-primary" 
                                  : "bg-gradient-to-r from-primary/10 to-primary/5 text-primary border-primary/20"
                              }`}
                            >
                              {activity.status === "done" ? "Done" : "Pending"}
                            </Badge>
                            <ArrowRight className="h-5 w-5 text-muted-foreground icon-scale cursor-pointer" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-3">
              <Link href="/dashboard/daily" className="cursor-pointer">
                <Card className="border-border/30 bg-white dark:bg-card cursor-pointer card-hover hover:border-primary/30 h-full">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="rounded-full p-3 bg-primary/10 icon-scale">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Daily View</p>
                      <p className="text-sm text-muted-foreground">See today's activities</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/reporting" className="cursor-pointer">
                <Card className="border-border/30 bg-white dark:bg-card cursor-pointer card-hover hover:border-accent/30 h-full">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="rounded-full p-3 bg-accent/10 icon-scale">
                      <BarChart3 className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Reports</p>
                      <p className="text-sm text-muted-foreground">Analyze metrics</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/team" className="cursor-pointer">
                <Card className="border-border/30 bg-white dark:bg-card cursor-pointer card-hover hover:border-primary/30 h-full">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="rounded-full p-3 bg-primary/10 icon-scale">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Team</p>
                      <p className="text-sm text-muted-foreground">View team members</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}