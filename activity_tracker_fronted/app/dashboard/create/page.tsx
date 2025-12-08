// app/dashboard/create/page.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/header"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { createActivity } from "@/lib/activity-store"
import { ArrowLeft, Loader2, Plus } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CreateActivity() {
  const { user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    activityType: "",
    title: "",
    description: "",
    smsCount: "",
    smsFromLogs: "",
    comparison: "",
    remark: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleActivityTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, activityType: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!user || !formData.activityType) {
      setError("Please select an activity type")
      return
    }

    setIsLoading(true)
    try {
      const fullDescription =
        formData.activityType === "sms-count"
          ? `SMS Count Comparison\n\nCurrent SMS Count: ${formData.smsCount}\nSMS Count from Logs: ${formData.smsFromLogs}\nComparison: ${formData.comparison}`
          : formData.description

      const titleText =
        formData.activityType === "sms-count" ? `Daily SMS count in comparison to SMS count from logs` : formData.title

      const result = await createActivity(titleText, fullDescription, formData.remark)

      if (result) {
        router.push("/dashboard")
      } else {
        setError("Failed to create activity. Please try again.")
      }
    } catch (err) {
      console.error("Error creating activity:", err)
      setError("Failed to create activity. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="mx-auto max-w-2xl px-6 py-8 lg:px-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-6 gap-2 hover-lift">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>

          <Card className="border-border/30">
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="rounded-full p-3 bg-primary/10">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Create New Activity</CardTitle>
                  <CardDescription>Log daily support team activities and metrics</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

                <div>
                  <label htmlFor="activityType" className="block text-sm font-medium text-foreground mb-2">
                    Activity Type
                  </label>
                  <Select value={formData.activityType} onValueChange={handleActivityTypeChange}>
                    <SelectTrigger className="border-border/30">
                      <SelectValue placeholder="Select activity type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sms-count">Daily SMS Count Comparison</SelectItem>
                      <SelectItem value="ticket-resolution">Ticket Resolution</SelectItem>
                      <SelectItem value="system-monitoring">System Monitoring</SelectItem>
                      <SelectItem value="incident-response">Incident Response</SelectItem>
                      <SelectItem value="other">Other Activity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.activityType === "sms-count" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="smsCount" className="block text-sm font-medium text-foreground mb-2">
                          Current SMS Count
                        </label>
                        <Input
                          id="smsCount"
                          name="smsCount"
                          type="number"
                          value={formData.smsCount}
                          onChange={handleChange}
                          placeholder="e.g., 1,250"
                          required
                          disabled={isLoading}
                          className="border-border/30"
                        />
                      </div>
                      <div>
                        <label htmlFor="smsFromLogs" className="block text-sm font-medium text-foreground mb-2">
                          SMS Count from Logs
                        </label>
                        <Input
                          id="smsFromLogs"
                          name="smsFromLogs"
                          type="number"
                          value={formData.smsFromLogs}
                          onChange={handleChange}
                          placeholder="e.g., 1,248"
                          required
                          disabled={isLoading}
                          className="border-border/30"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="comparison" className="block text-sm font-medium text-foreground mb-2">
                        Comparison Analysis
                      </label>
                      <textarea
                        id="comparison"
                        name="comparison"
                        value={formData.comparison}
                        onChange={handleChange}
                        placeholder="Note any discrepancies and reasons..."
                        rows={3}
                        disabled={isLoading}
                        className="w-full rounded-lg border border-border/30 bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                      />
                    </div>
                  </>
                )}

                {formData.activityType !== "sms-count" && formData.activityType && (
                  <>
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                        Activity Title
                      </label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter activity title"
                        required
                        disabled={isLoading}
                        className="border-border/30"
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe the activity..."
                        rows={4}
                        disabled={isLoading}
                        className="w-full rounded-lg border border-border/30 bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="remark" className="block text-sm font-medium text-foreground mb-2">
                    Additional Remarks / Notes
                  </label>
                  <textarea
                    id="remark"
                    name="remark"
                    value={formData.remark}
                    onChange={handleChange}
                    placeholder="Add any remarks or notes..."
                    rows={3}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-border/30 bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1 hover-lift"
                    disabled={isLoading || !formData.activityType}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Activity"
                    )}
                  </Button>
                  <Link href="/dashboard" className="flex-1">
                    <Button type="button" variant="outline" size="lg" className="w-full bg-transparent hover-lift">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  )
}
