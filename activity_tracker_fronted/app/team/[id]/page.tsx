import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Mail, Phone, Calendar } from "lucide-react"

interface MemberDetails {
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
  bio: string
  skills: string[]
  recentActivities: Array<{ date: string; completed: number; pending: number }>
}

const memberDetails: Record<string, MemberDetails> = {
  "1": {
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
    bio: "Experienced support lead with 10+ years in customer success and team management. Specializes in process optimization and team training.",
    skills: ["Team Management", "Problem Solving", "SMS Systems", "Database Optimization", "Documentation"],
    recentActivities: [
      { date: "Today", completed: 3, pending: 0 },
      { date: "Yesterday", completed: 4, pending: 1 },
      { date: "2 Days Ago", completed: 5, pending: 0 },
    ],
  },
  "2": {
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
    bio: "Senior analyst with strong technical background. Expert in system monitoring and infrastructure troubleshooting.",
    skills: ["Infrastructure Monitoring", "System Analysis", "Performance Tuning", "API Management", "Security"],
    recentActivities: [
      { date: "Today", completed: 3, pending: 1 },
      { date: "Yesterday", completed: 6, pending: 0 },
      { date: "2 Days Ago", completed: 4, pending: 2 },
    ],
  },
}

export default async function MemberProfile(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const { id } = params
  const member = memberDetails[id]

  if (!member) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-4xl px-6 py-8 lg:px-8">
          <p className="text-muted-foreground">Member not found</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-4xl px-6 py-8 lg:px-8">
        <Link href="/team">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Team
          </Button>
        </Link>

        {/* Profile Header */}
        <Card className="mb-8 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-8">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground text-3xl font-bold">
                {member.avatar}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col items-center gap-2 sm:flex-row">
                  <h1 className="text-3xl font-bold text-foreground">{member.name}</h1>
                  <Badge variant="outline">{member.employeeId}</Badge>
                </div>
                <p className="mt-2 text-lg text-accent">{member.role}</p>
                <p className="mt-1 text-sm text-muted-foreground">{member.department}</p>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground">{member.bio}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Details */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="mt-1 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm text-foreground">{member.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-1 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm text-foreground">{member.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="mt-1 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Joined</p>
                  <p className="text-sm text-foreground">{member.joinDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Activities Today</p>
                <p className="mt-2 text-3xl font-bold text-primary">{member.activitiesToday}</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">Completion Rate</p>
                  <span className="font-bold text-foreground">{member.completionRate}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="bg-accent h-full transition-all" style={{ width: `${member.completionRate}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Skills */}
        <Card className="mb-8 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Skills & Expertise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {member.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity Summary</CardTitle>
            <CardDescription>Last 3 days of activity statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {member.recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0"
                >
                  <p className="font-medium text-foreground">{activity.date}</p>
                  <div className="flex gap-6">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Completed</p>
                      <p className="text-sm font-bold text-accent">{activity.completed}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Pending</p>
                      <p className="text-sm font-bold text-orange-500">{activity.pending}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
