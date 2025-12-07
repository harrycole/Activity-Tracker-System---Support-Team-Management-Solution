"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone } from "lucide-react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/protected-route"

interface TeamMember {
  id: string
  name: string
  role: string
  employeeId: string
  department: string
  email: string
  phone: string
  joinDate: string
  activitiesToday: number
  completionRate: number
  avatar: string
}

export default function TeamMembers() {
  const [teamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "John Smith",
      role: "Support Lead",
      employeeId: "EMP001",
      department: "Applications Support",
      email: "john.smith@company.com",
      phone: "+1 (555) 123-4567",
      joinDate: "2022-03-15",
      activitiesToday: 3,
      completionRate: 100,
      avatar: "JS",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      role: "Senior Support Analyst",
      employeeId: "EMP002",
      department: "Applications Support",
      email: "sarah.johnson@company.com",
      phone: "+1 (555) 234-5678",
      joinDate: "2021-07-22",
      activitiesToday: 4,
      completionRate: 75,
      avatar: "SJ",
    },
    {
      id: "3",
      name: "Mike Chen",
      role: "Support Specialist",
      employeeId: "EMP003",
      department: "Applications Support",
      email: "mike.chen@company.com",
      phone: "+1 (555) 345-6789",
      joinDate: "2023-01-10",
      activitiesToday: 2,
      completionRate: 100,
      avatar: "MC",
    },
    {
      id: "4",
      name: "Emma Davis",
      role: "Support Specialist",
      employeeId: "EMP004",
      department: "Applications Support",
      email: "emma.davis@company.com",
      phone: "+1 (555) 456-7890",
      joinDate: "2023-06-05",
      activitiesToday: 3,
      completionRate: 67,
      avatar: "ED",
    },
  ])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Team Members</h1>
            <p className="mt-2 text-muted-foreground">View and manage your support team profiles</p>
          </div>

          {/* Team Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {teamMembers.map((member) => (
              <Card key={member.id} className="border-border/50 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                        {member.avatar}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{member.employeeId}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-secondary/30 p-4 space-y-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Department</p>
                      <p className="text-sm text-foreground">{member.department}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Employee Since</p>
                      <p className="text-sm text-foreground">{member.joinDate}</p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-border/50 pt-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-foreground">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-foreground">{member.phone}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Activities Today</p>
                      <p className="mt-1 text-2xl font-bold text-primary">{member.activitiesToday}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Completion Rate</p>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex-1 rounded-full bg-secondary h-2">
                          <div
                            className="bg-accent h-full rounded-full"
                            style={{ width: `${member.completionRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-foreground">{member.completionRate}%</span>
                      </div>
                    </div>
                  </div>

                  <Link href={`/team/${member.id}`} className="block">
                    <Button variant="outline" className="w-full border-border/50 bg-transparent">
                      View Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
