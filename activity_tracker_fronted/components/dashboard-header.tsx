"use client"

import { Button } from "@/components/ui/button"
import { Menu, Moon, Sun, User } from "lucide-react"
import { useRouter } from "next/navigation"

interface DashboardHeaderProps {
  onMenuClick: () => void
  darkMode?: boolean
  user?: any
  onToggleDarkMode?: () => void
}

export function DashboardHeader({ 
  onMenuClick, 
  darkMode, 
  user, 
  onToggleDarkMode 
}: DashboardHeaderProps) {
  const router = useRouter()

  const navigateToProfile = () => {
    router.push("/profile")
  }

  // Function to format user name
  const formatUserName = (name: string) => {
    if (!name) return "Guest User"
    
    // Take only first two words (first name + last name)
    const nameParts = name.trim().split(/\s+/)
    
    // If name has more than 2 words, take first and last
    if (nameParts.length > 2) {
      return `${nameParts[0]} ${nameParts[nameParts.length - 1]}`
    }
    
    // If name is too long (more than 15 chars), truncate it
    if (name.length > 15) {
      return name.substring(0, 12) + "..."
    }
    
    return name
  }

  const userName = formatUserName(user?.name || "Guest User")

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/30 bg-white dark:bg-background/98 backdrop-blur-md">
      <div className="px-6 py-4 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Left side - Just the menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="btn-oval lg:hidden hover:bg-primary/10 cursor-pointer"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          {/* Empty space on left for desktop */}
          <div className="flex-1" />
          
          {/* Right side - User info and dark mode toggle */}
          <div className="flex items-center gap-4">
            {/* User Card - Clickable for profile */}
            <Button
              variant="ghost"
              className="btn-oval p-2 hover:bg-primary/10 flex items-center gap-3 cursor-pointer transition-all duration-200"
              onClick={navigateToProfile}
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="hidden lg:flex flex-col items-start">
                <p className="text-sm font-semibold text-foreground truncate max-w-[120px]">
                  {userName}
                </p>
              </div>
            </Button>
            
            {/* Dark Mode Toggle */}
            {onToggleDarkMode && (
              <Button
                variant="ghost"
                size="icon"
                className="btn-oval hover:bg-primary/10 cursor-pointer"
                onClick={onToggleDarkMode}
              >
                {darkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}