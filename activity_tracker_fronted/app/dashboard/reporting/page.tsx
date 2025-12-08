"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Input } from "@/components/ui/input"
import { Calendar, Loader2 } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { fetchActivities, type Activity } from "@/lib/activity-store"

interface Report {
  date: string
  totalActivities: number
  completed: number
  pending: number
  completionRate: number
}

export default function Reporting() {
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  )
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0])
  const [reportData, setReportData] = useState<Report[]>([])
  const [generated, setGenerated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [allActivities, setAllActivities] = useState<Activity[]>([])

  // Load all activities on mount
  useEffect(() => {
    loadAllActivities()
  }, [])

  const loadAllActivities = async () => {
    setLoading(true)
    try {
      const data = await fetchActivities()
      setAllActivities(data)
    } catch (error) {
      console.error('Error loading activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    setLoading(true)
    try {
      // If we don't have all activities loaded yet, fetch them
      let activitiesToUse = allActivities
      if (allActivities.length === 0) {
        activitiesToUse = await fetchActivities()
        setAllActivities(activitiesToUse)
      }

      // Filter activities by date range
      const filteredActivities = activitiesToUse.filter(activity => {
        const activityDate = new Date(activity.created_at).toISOString().split('T')[0]
        return activityDate >= startDate && activityDate <= endDate
      })

      // Group activities by date
      const grouped = new Map<string, Activity[]>()
      filteredActivities.forEach((activity) => {
        const date = activity.created_at.split("T")[0]
        if (!grouped.has(date)) {
          grouped.set(date, [])
        }
        grouped.get(date)!.push(activity)
      })

      // Generate report
      const report: Report[] = Array.from(grouped.entries())
        .map(([date, acts]) => ({
          date,
          totalActivities: acts.length,
          completed: acts.filter((a) => a.status === "done").length,
          pending: acts.filter((a) => a.status === "pending").length,
          completionRate: acts.length > 0 ? Math.round((acts.filter((a) => a.status === "done").length / acts.length) * 100) : 0,
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setReportData(report)
      setGenerated(true)
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalActivities = reportData.reduce((sum, r) => sum + r.totalActivities, 0)
  const totalCompleted = reportData.reduce((sum, r) => sum + r.completed, 0)
  const avgCompletionRate =
    reportData.length > 0 ? Math.round(reportData.reduce((sum, r) => sum + r.completionRate, 0) / reportData.length) : 0

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Activity Reports</h1>
            <p className="mt-2 text-muted-foreground">Analyze activity histories and performance metrics</p>
          </div>

          {/* Date Filter */}
          <Card className="mb-8 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Filter by Date Range</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="border-border/50"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-foreground mb-2">End Date</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="border-border/50"
                      disabled={loading}
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleGenerateReport} 
                  className="w-full sm:w-auto"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Report"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {loading && !generated ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading activities...</p>
              </div>
            </div>
          ) : generated && reportData.length > 0 ? (
            <>
              {/* Summary Statistics */}
              <div className="mb-8 grid gap-6 md:grid-cols-4">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-primary">{totalActivities}</p>
                    <p className="mt-2 text-xs text-muted-foreground">in selected period</p>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-accent">{totalCompleted}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {totalActivities > 0 ? Math.round((totalCompleted / totalActivities) * 100) : 0}% of total
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-orange-500">{totalActivities - totalCompleted}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {totalActivities > 0
                        ? Math.round(((totalActivities - totalCompleted) / totalActivities) * 100)
                        : 0}
                      % of total
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-primary">{avgCompletionRate}%</p>
                    <p className="mt-2 text-xs text-muted-foreground">across all days</p>
                  </CardContent>
                </Card>
              </div>

              {/* Daily Reports Table */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Daily Breakdown</CardTitle>
                  <CardDescription>Activity statistics for each day in the selected range</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="px-4 py-3 text-left font-medium text-foreground">Date</th>
                          <th className="px-4 py-3 text-left font-medium text-foreground">Total</th>
                          <th className="px-4 py-3 text-left font-medium text-foreground">Completed</th>
                          <th className="px-4 py-3 text-left font-medium text-foreground">Pending</th>
                          <th className="px-4 py-3 text-left font-medium text-foreground">Completion Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.map((report) => (
                          <tr
                            key={report.date}
                            className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                          >
                            <td className="px-4 py-4 text-foreground">{report.date}</td>
                            <td className="px-4 py-4 text-foreground">{report.totalActivities}</td>
                            <td className="px-4 py-4 text-accent">{report.completed}</td>
                            <td className="px-4 py-4 text-orange-500">{report.pending}</td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 rounded-full bg-secondary h-2 overflow-hidden">
                                  <div
                                    className="bg-primary h-full transition-all"
                                    style={{ width: `${report.completionRate}%` }}
                                  />
                                </div>
                                <span className="font-medium text-foreground">{report.completionRate}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : generated && reportData.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">No activities found for the selected date range</p>
              </CardContent>
            </Card>
          ) : null}
        </main>
      </div>
    </ProtectedRoute>
  )
}
