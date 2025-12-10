// app/dashboard/activity/[id]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProtectedRoute } from "@/components/protected-route"
import { 
  fetchActivity, 
  fetchActivityUpdates, 
  createActivityUpdateViaAPI,
  type Activity, 
  type ActivityUpdate 
} from "@/lib/activity-store"
import { 
  Loader2, 
  User, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Clock,
  Activity as ActivityIcon,
  History,
  Pencil,
  CheckCircle,
  AlertCircle,
  Send,
  ChevronDown,
  ChevronUp,
  Tag,
  Hash,
  FileCode,
  UserCog,
  CalendarClock,
  Copy,
  Eye,
  EyeOff
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Textarea } from "@/components/ui/textarea"
import { DashboardHeader } from "@/components/dashboard-header"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow, format } from "date-fns"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function ActivityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, logout } = useAuth()
  const activityId = params.id as string
  
  const [activity, setActivity] = useState<Activity | null>(null)
  const [updates, setUpdates] = useState<ActivityUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [remark, setRemark] = useState("")
  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const [expandedUpdateId, setExpandedUpdateId] = useState<string | null>(null)
  const [newStatus, setNewStatus] = useState<"pending" | "done">("pending")
  const [darkMode, setDarkMode] = useState(false)
  const [progress, setProgress] = useState("")
  const [showId, setShowId] = useState(false)

  useEffect(() => {
    loadActivity()
    // Check for dark mode preference
    if (localStorage.getItem("theme") === "dark" || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    }
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
      setNewStatus(activityData.status)
      
      const updatesData = await fetchActivityUpdates(activityId)
      setUpdates(updatesData.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ))
    } catch (error) {
      console.error('Error loading activity:', error)
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

  const handleSubmitUpdate = async () => {
    if (!activity || !user) return
    
    setSubmitting(true)
    try {
      // Create the activity update
      const update = await createActivityUpdateViaAPI(
        activity.activity_id,
        newStatus,
        remark.trim(),
        progress.trim() || `Status changed to ${newStatus}`
      )
      
      if (update) {
        toast.success("Update added successfully")
        // Reload activity to get the latest status and updates
        await loadActivity()
        setRemark("")
        setProgress("")
        setShowUpdateForm(false)
      }
    } catch (error) {
      console.error('Error submitting update:', error)
      toast.error("Failed to add update")
    } finally {
      setSubmitting(false)
    }
  }

  const toggleUpdateExpansion = (updateId: string) => {
    setExpandedUpdateId(expandedUpdateId === updateId ? null : updateId)
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-white dark:bg-background">
          <main className="flex items-center justify-center h-screen">
            <div className="flex flex-col items-center gap-4 fade-in">
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
        <div className="min-h-screen bg-white dark:bg-background">
          <DashboardHeader 
            onMenuClick={() => {}} // No drawer needed here
            darkMode={darkMode}
            user={user}
            onToggleDarkMode={toggleDarkMode}
          />
          <main className="mx-auto max-w-7xl px-6 py-8">
            <Card className="border-border/30 bg-white dark:bg-card card-hover">
              <CardContent className="py-16 text-center">
                <div className="mx-auto max-w-md">
                  <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Activity Not Found</h3>
                  <p className="text-muted-foreground mb-6">The activity you're looking for doesn't exist or you don't have permission to view it.</p>
                  <Button 
                    onClick={() => router.push('/dashboard')}
                    className="gap-2 btn-oval px-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  // Calculate activity duration
  const activityDuration = Math.floor(
    (new Date().getTime() - new Date(activity.created_at).getTime()) / (1000 * 60 * 60 * 24)
  )

  const sortedUpdates = [...updates].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white dark:bg-background">
        <DashboardHeader 
          onMenuClick={() => {}} // No drawer on activity detail page
          darkMode={darkMode}
          user={user}
          onToggleDarkMode={toggleDarkMode}
        />

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="slide-up">
                <div className="flex items-center gap-3 mb-2">
                  <Badge
                    variant={activity.status === "done" ? "default" : "secondary"}
                    className={`btn-oval ${
                      activity.status === "done" 
                        ? "bg-gradient-to-r from-primary to-primary/80 text-white border-primary" 
                        : "bg-gradient-to-r from-primary/10 to-primary/5 text-primary border-primary/20"
                    }`}
                  >
                    {activity.status === "done" ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Done
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </>
                    )}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowId(!showId)}
                      className="h-6 px-2 text-xs"
                    >
                      {showId ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      <span className="ml-1">ID</span>
                    </Button>
                  </div>
                </div>
                
                <h1 className="text-2xl font-bold text-foreground mb-2">{activity.title}</h1>
                {showId && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Hash className="h-3 w-3" />
                      <code className="bg-accent/10 px-2 py-1 rounded text-xs font-mono">
                        {activity.activity_id}
                      </code>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(activity.activity_id, "Activity ID")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Created {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant={showUpdateForm ? "default" : "outline"}
                  size="sm"
                  className="gap-2 btn-oval"
                  onClick={() => setShowUpdateForm(!showUpdateForm)}
                >
                  <Pencil className="h-4 w-4" />
                  {showUpdateForm ? "Cancel" : "Add Update"}
                </Button>
              </div>
            </div>
          </div>

          {/* Update Form */}
          {showUpdateForm && (
            <Card className="mb-6 border-border/30 bg-white dark:bg-card card-hover">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Add Update</CardTitle>
                <CardDescription>Track progress or change status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-2 block">
                      Status
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={newStatus === "pending" ? "default" : "outline"}
                        onClick={() => setNewStatus("pending")}
                        className="gap-2 btn-oval"
                      >
                        <Clock className="h-4 w-4" />
                        Pending
                      </Button>
                      <Button
                        type="button"
                        variant={newStatus === "done" ? "default" : "outline"}
                        onClick={() => setNewStatus("done")}
                        className="gap-2 btn-oval"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Done
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-foreground mb-2 block">
                      Progress Update
                    </Label>
                    <Input
                      placeholder="Describe what progress was made..."
                      value={progress}
                      onChange={(e) => setProgress(e.target.value)}
                      disabled={submitting}
                      className="border-border/50 focus:border-primary/50"
                    />
                    <p className="mt-1 text-sm text-muted-foreground">
                      This will be saved as the progress field in the database
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-foreground mb-2 block">
                      Remarks (Optional)
                    </Label>
                    <Textarea
                      placeholder="Add any additional remarks or notes..."
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      disabled={submitting}
                      className="min-h-[100px] border-border/50 focus:border-primary/50 transition-colors duration-200 bg-white dark:bg-background"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowUpdateForm(false)
                        setRemark("")
                        setProgress("")
                      }}
                      className="btn-oval"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitUpdate}
                      disabled={submitting || (!remark.trim() && !progress.trim())}
                      className="gap-2 btn-oval px-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Submit Update
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Activity Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Activity Information Card */}
              <Card className="border-border/30 bg-white dark:bg-card card-hover">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileCode className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Activity Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-foreground">
                              {activity.creator?.name || "Unknown"}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              <UserCog className="h-3 w-3 mr-1" />
                              Creator
                            </Badge>
                          </div>
                          {activity.creator?.department && (
                            <p className="text-xs text-muted-foreground">
                              {activity.creator.department}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <code className="text-xs text-muted-foreground bg-accent/10 px-2 py-0.5 rounded">
                              {activity.created_by}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => copyToClipboard(activity.created_by, "Creator ID")}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-3 pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CalendarClock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Created At</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-foreground">
                              {format(new Date(activity.created_at), "PPpp")}
                            </span>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Updated At</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-foreground">
                              {format(new Date(activity.updated_at), "PPpp")}
                            </span>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(activity.updated_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Duration</span>
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {activityDuration} day{activityDuration !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Description */}
              <Card className="border-border/30 bg-white dark:bg-card card-hover">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Description</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {activity.description ? (
                    <p className="text-foreground whitespace-pre-line leading-relaxed">
                      {activity.description}
                    </p>
                  ) : (
                    <p className="text-muted-foreground italic">No description provided</p>
                  )}
                </CardContent>
              </Card>

              {/* Activity Updates */}
              <Card className="border-border/30 bg-white dark:bg-card card-hover">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">Activity Updates</CardTitle>
                      <CardDescription>History of changes and progress</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {updates.length} update{updates.length !== 1 ? 's' : ''}
                  </Badge>
                </CardHeader>
                <CardContent>
                  {sortedUpdates.length > 0 ? (
                    <div className="space-y-4">
                      {sortedUpdates.map((update) => (
                        <div 
                          key={update.update_id} 
                          className={`border rounded-lg transition-colors duration-150 ${
                            expandedUpdateId === update.update_id 
                              ? 'border-primary/30 bg-primary/5' 
                              : 'border-border/30 hover:border-border/50 hover:bg-accent/5'
                          }`}
                        >
                          <div 
                            className="p-4 cursor-pointer"
                            onClick={() => toggleUpdateExpansion(update.update_id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs bg-accent text-accent-foreground">
                                    {update.user?.name?.charAt(0) || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-foreground">
                                      {update.user?.name || "Unknown"}
                                    </p>
                                    <div className="flex items-center gap-1">
                                      <Badge
                                        variant={update.status === "done" ? "default" : "secondary"}
                                        className={`text-xs ${
                                          update.status === "done"
                                            ? "bg-green-100 text-green-800 hover:bg-green-100 border-0"
                                            : "bg-blue-100 text-blue-800 hover:bg-blue-100 border-0"
                                        }`}
                                      >
                                        {update.status}
                                      </Badge>
                                      <code className="text-xs text-muted-foreground bg-accent/10 px-1.5 py-0.5 rounded">
                                        {update.update_id}
                                      </code>
                                    </div>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {expandedUpdateId === update.update_id ? (
                                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            </div>
                            
                            {update.progress && (
                              <div className="mt-3 ml-11">
                                <div className="flex items-start gap-2">
                                  <Tag className="h-3 w-3 text-muted-foreground mt-0.5" />
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    <span className="font-medium">Progress:</span> {update.progress}
                                  </p>
                                </div>
                              </div>
                            )}
                            
                            {update.remark && !expandedUpdateId && (
                              <div className="mt-3 ml-11">
                                <div className="flex items-start gap-2">
                                  <FileText className="h-3 w-3 text-muted-foreground mt-0.5" />
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    <span className="font-medium">Remark:</span> {update.remark}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Expanded content */}
                          {expandedUpdateId === update.update_id && (
                            <div className="px-4 pb-4 ml-11 border-t border-border/30 pt-4 space-y-3">
                              {update.remark && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Remark:</p>
                                  <div className="bg-white dark:bg-background/50 p-3 rounded border border-border/30">
                                    <p className="text-sm text-foreground whitespace-pre-line">
                                      {update.remark}
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              {update.progress && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Progress:</p>
                                  <div className="text-sm text-foreground bg-accent/5 p-3 rounded">
                                    {update.progress}
                                  </div>
                                </div>
                              )}
                              
                              <div className="text-xs text-muted-foreground flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-1">
                                    <span>Update ID:</span>
                                    <code className="bg-accent/10 px-1.5 py-0.5 rounded">
                                      {update.update_id}
                                    </code>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span>Updated by:</span>
                                    <code className="bg-accent/10 px-1.5 py-0.5 rounded">
                                      {update.updated_by}
                                    </code>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5"
                                  onClick={() => copyToClipboard(update.update_id, "Update ID")}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="mx-auto w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                        <History className="h-6 w-6 text-accent" />
                      </div>
                      <h3 className="text-sm font-medium text-foreground mb-1">No updates yet</h3>
                      <p className="text-sm text-muted-foreground">Be the first to add an update</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Stats & Actions */}
            <div className="space-y-6">
              {/* Activity Stats */}
              <Card className="border-border/30 bg-white dark:bg-card card-hover">
                <CardHeader>
                  <CardTitle className="text-lg">Activity Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Updates</span>
                      <span className="text-sm font-medium text-foreground">{updates.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Current Status</span>
                      <Badge
                        variant={activity.status === "done" ? "default" : "secondary"}
                        className="text-xs btn-oval"
                      >
                        {activity.status === "done" ? "Completed" : "Active"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Last Update</span>
                      <span className="text-sm text-foreground">
                        {updates.length > 0 
                          ? formatDistanceToNow(new Date(updates[0].created_at), { addSuffix: true })
                          : "Never"
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-border/30 bg-white dark:bg-card card-hover">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 hover:bg-accent/10 transition-colors duration-200"
                      onClick={() => setShowUpdateForm(!showUpdateForm)}
                    >
                      <Pencil className="h-4 w-4" />
                      {showUpdateForm ? "Hide Update Form" : "Add Update"}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 text-red-600 dark:text-red-400"
                    >
                      <AlertCircle className="h-4 w-4" />
                      Report Issue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}