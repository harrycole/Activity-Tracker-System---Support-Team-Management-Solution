"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Plus, Calendar, BarChart3, Users } from "lucide-react"

export function DashboardNav() {
  const pathname = usePathname()

  const links = [
    { href: "/dashboard", label: "Activities", icon: CheckCircle2 },
    { href: "/dashboard/create", label: "New Activity", icon: Plus },
    { href: "/dashboard/daily", label: "Daily View", icon: Calendar },
    { href: "/dashboard/reporting", label: "Reports", icon: BarChart3 },
    { href: "/team", label: "Team", icon: Users },
  ]

  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) => {
        const Icon = link.icon
        const isActive = pathname === link.href
        return (
          <Link key={link.href} href={link.href}>
            <Button variant={isActive ? "default" : "ghost"} className="w-full justify-start gap-3" asChild>
              <span>
                <Icon className="h-4 w-4" />
                {link.label}
              </span>
            </Button>
          </Link>
        )
      })}
    </nav>
  )
}
