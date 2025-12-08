"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Badge } from "@/components/ui/badge"
import { ProtectedRoute } from "@/components/protected-route"
import Link from "next/link"
import { ArrowLeft, Mail, Briefcase, Calendar } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="mx-auto max-w-2xl px-6 py-8 lg:px-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-6 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-8">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-3xl font-bold text-foreground">{user.name}</h1>
                  <p className="mt-1 text-sm text-muted-foreground">{user.department}</p>
                  <p className="mt-4 text-sm text-foreground">User ID: {user.user_id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 grid gap-6 md:grid-cols-1">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Account Information</CardTitle>
                <CardDescription>Your profile details and account status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="mt-1 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email Address</p>
                      <p className="mt-1 text-sm text-foreground">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Briefcase className="mt-1 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Department</p>
                      <p className="mt-1 text-sm text-foreground">{user.department}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="mt-1 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Member Since</p>
                      <p className="mt-1 text-sm text-foreground">{new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-6">
                  <p className="text-sm font-medium text-foreground mb-4">Account Status</p>
                  <Badge variant="default" className="bg-primary">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
