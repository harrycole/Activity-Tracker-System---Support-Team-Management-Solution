"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  LogOut, 
  ChevronLeft 
} from "lucide-react"

interface DashboardDrawerProps {
  open: boolean
  darkMode: boolean
  user: any
  navItems: Array<{
    icon: any
    label: string
    href: string
  }>
  onClose: () => void
  onToggleDarkMode: () => void
  onLogout: () => void
}

export function DashboardDrawer({
  open,
  navItems,
  onClose,
  onLogout
}: DashboardDrawerProps) {
  return (
    <>
      {/* Drawer Overlay - Only on mobile */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sleek Redesigned Left Drawer */}
      <div className={`
        fixed left-0 top-0 h-full w-72 bg-card/90 backdrop-blur-md border-r border-border/20 
        drawer-slide z-40 shadow-2xl flex flex-col
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Drawer Header with Close Button */}
        <div className="p-6 border-b border-border/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                <span className="text-sm font-bold text-primary-foreground">AT</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">ActivityTracker</h2>
                <p className="text-xs text-muted-foreground mt-1">Analytics Dashboard</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="btn-oval lg:hidden hover:bg-primary/10"
              onClick={onClose}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>

          
        </div>

        {/* Navigation Links - Sleek Design */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">Navigation</p>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 p-3 rounded-xl text-foreground/80 hover:text-foreground hover:bg-primary/5 transition-all duration-200 group slide-up border border-transparent hover:border-primary/10"
              style={{ animationDelay: `${navItems.indexOf(item) * 50}ms` }}
              onClick={onClose}
            >
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <item.icon className="h-4 w-4 text-primary/80 group-hover:text-primary" />
              </div>
              <span className="text-sm font-medium">{item.label}</span>
              <ChevronLeft className="h-4 w-4 ml-auto transform -rotate-180 text-muted-foreground/50 group-hover:text-primary/60 transition-colors" />
            </Link>
          ))}
        </nav>

        {/* Drawer Footer with Dark Mode and Logout */}
        <div className="p-6 border-t border-border/20 space-y-3">
          
          {/* Logout Button */}
          <Button
            variant="ghost"
            className="w-full btn-oval justify-start gap-3 hover:bg-destructive/10 text-foreground/80 hover:text-destructive p-3"
            onClick={onLogout}
          >
            <div className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center">
              <LogOut className="h-4 w-4 text-destructive/80" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">Logout</p>
            </div>
          </Button>
        </div>
      </div>
    </>
  )
}