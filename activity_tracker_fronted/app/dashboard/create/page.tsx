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
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CreateActivity() {
  const { user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    activityType: "", // added activity type selection
    title: "",
    description: "",
    smsCount: "", // added SMS-specific fields
    smsFromLogs: "",
    comparison: "",
    remark: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleActivityTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, activityType: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.activityType) return

    setIsLoading(true)
    try {
      const fullDescription =
        formData.activityType === "sms-count"
          ? `SMS Count Comparison\n\nCurrent SMS Count: ${formData.smsCount}\nSMS Count from Logs: ${formData.smsFromLogs}\nComparison: ${formData.comparison}`
          : formData.description

      const titleText =
        formData.activityType === "sms-count" ? `Daily SMS count in comparison to SMS count from logs` : formData.title

      createActivity(titleText, fullDescription, user.id, user.name, user.department)
      router.push("/dashboard")
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
            <Button variant="ghost" className="mb-6 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Activities
            </Button>
          </Link>

          <Card className="border-border/50">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl">Create New Activity</CardTitle>
              <CardDescription>Log daily support team activities and metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="activityType" className="block text-sm font-medium text-foreground mb-2">
                    Activity Type
                  </label>
                  <Select value={formData.activityType} onValueChange={handleActivityTypeChange}>
                    <SelectTrigger className="border-border/50">
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
                          className="border-border/50"
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
                          className="border-border/50"
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
                        className="w-full rounded-lg border border-border/50 bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
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
                        className="border-border/50"
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
                        className="w-full rounded-lg border border-border/50 bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
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
                    className="w-full rounded-lg border border-border/50 bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" size="lg" className="flex-1" disabled={isLoading || !formData.activityType}>
                    {isLoading ? "Creating..." : "Create Activity"}
                  </Button>
                  <Link href="/dashboard" className="flex-1">
                    <Button type="button" variant="outline" size="lg" className="w-full bg-transparent">
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
