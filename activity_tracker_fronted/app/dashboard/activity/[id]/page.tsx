// app/dashboard/activity/[id]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Badge } from "@/components/ui/badge"
import { ProtectedRoute } from "@/components/protected-route"
import { 
  fetchActivity, 
  fetchActivityUpdates, 
  updateActivityStatus, 
  type Activity, 
  type ActivityUpdate 
} from "@/lib/activity-store"
import { ArrowLeft, Loader2, User, Calendar, FileText, CheckCircle, XCircle, Building } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Textarea } from "@/components/ui/textarea"

export default function ActivityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const activityId = params.id as string
  
  const [activity, setActivity] = useState<Activity | null>(null)
  const [updates, setUpdates] = useState<ActivityUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [remark, setRemark] = useState("")

  useEffect(() => {
    loadActivity()
  }, [activityId])

  const loadActivity = async () => {
    setLoading(true)
    try {
      const activityData = await fetchActivity(activityId)
      if (!activityData) {
        router.push('/dashboard')
        return
      }
      setActivity(activityData)
      
      // If activity already has updates from the API, use them
      if (activityData.updates && activityData.updates.length > 0) {
        setUpdates(activityData.updates)
      } else {
        // Otherwise fetch updates separately
        const updatesData = await fetchActivityUpdates(activityId)
        setUpdates(updatesData)
      }
    } catch (error) {
      console.error('Error loading activity:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusToggle = async () => {
    if (!activity || !user) return
    
    setUpdating(true)
    try {
      const newStatus = activity.status === "done" ? "pending" : "done"
      const updated = await updateActivityStatus(activity.activity_id, newStatus, remark)
      
      if (updated) {
        setRemark("") // Clear remark after update
        await loadActivity() // Reload to get fresh data
      }
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="flex items-center justify-center h-[calc(100vh-80px)]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading activity details...</p>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  if (!activity) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="mx-auto max-w-4xl px-6 py-8">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">Activity not found</p>
                <Link href="/dashboard">
                  <Button>Back to Dashboard</Button>
                </Link>
              </CardContent>
            </Card>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="mx-auto max-w-4xl px-6 py-8 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/dashboard">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Activities
              </Button>
            </Link>
            
            <div className="flex items-center gap-4">
              <Badge variant={activity.status === "done" ? "default" : "secondary"}>
                {activity.status === "done" ? "Done" : "Pending"}
              </Badge>
            </div>
          </div>

          <Card className="mb-8 border-border/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{activity.title}</CardTitle>
                  <CardDescription className="mt-2">
                    Created on {new Date(activity.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Created By</p>
                      <p className="font-medium">
                        {activity.creator?.name || "Loading..."}
                      </p>
                    </div>
                  </div>
                  
                  {activity.creator?.department && (
                    <div className="flex items-center gap-3 ml-8">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Department</p>
                        <p className="font-medium text-sm">
                          {activity.creator.department}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="font-medium">
                      {new Date(activity.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {activity.description && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-medium">Description</h3>
                  </div>
                  <p className="text-foreground whitespace-pre-line">{activity.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Update Section */}
          <Card className="mb-8 border-border/50">
            <CardHeader>
              <CardTitle>Update Activity Status</CardTitle>
              <CardDescription>Change status and add remarks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Add Remark (Optional)
                </label>
                <Textarea
                  placeholder="Enter any remarks or notes..."
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  disabled={updating}
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={handleStatusToggle}
                  disabled={updating}
                  variant={activity.status === "done" ? "outline" : "default"}
                  className="gap-2"
                >
                  {updating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : activity.status === "done" ? (
                    <>
                      <XCircle className="h-4 w-4" />
                      Mark as Pending
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Mark as Done
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity Updates */}
          {updates.length > 0 ? (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Activity Updates</CardTitle>
                <CardDescription>History of changes to this activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {updates.map((update) => (
                    <div key={update.update_id} className="border-b border-border/50 pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={update.status === "done" ? "default" : "secondary"}>
                            {update.status === "done" ? "Done" : "Pending"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(update.created_at).toLocaleString()}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          by {update.updater?.name || "Unknown"}
                        </span>
                      </div>
                      {update.remark && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-muted-foreground mb-1">Remark:</p>
                          <p className="text-sm text-foreground">{update.remark}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/50">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No updates for this activity yet</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
