// components/history-provider.tsx
"use client"

import { usePathname } from "next/navigation"
import { createContext, useContext, useEffect, useState } from "react"

interface HistoryContextType {
  history: string[]
  canGoBack: () => boolean
  goBack: () => string
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined)

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [history, setHistory] = useState<string[]>([pathname])

  useEffect(() => {
    setHistory(prev => {
      // Only add to history if it's a different path
      if (prev[prev.length - 1] !== pathname) {
        // Keep only last 10 history entries to prevent memory issues
        return [...prev.slice(-9), pathname]
      }
      return prev
    })
  }, [pathname])

  const canGoBack = () => history.length > 1

  const goBack = (): string => {
    if (canGoBack()) {
      // Remove current page from history
      const newHistory = history.slice(0, -1)
      const previousPage = newHistory[newHistory.length - 1]
      setHistory(newHistory)
      
      // Return the previous page
      return previousPage
    }
    return "/dashboard" // Fallback to dashboard
  }

  return (
    <HistoryContext.Provider value={{ history, canGoBack, goBack }}>
      {children}
    </HistoryContext.Provider>
  )
}

export function useHistory() {
  const context = useContext(HistoryContext)
  if (context === undefined) {
    throw new Error("useHistory must be used within a HistoryProvider")
  }
  return context
}