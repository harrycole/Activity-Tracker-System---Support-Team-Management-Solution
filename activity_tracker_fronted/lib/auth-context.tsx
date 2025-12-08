"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import axiosInstance from "@/lib/axiosInstance" // Import axiosInstance

interface User {
  user_id: string 
  email: string
  name: string
  department?: string  
  bio?: string
  created_at: string 
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, department: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (stored) {
      setUser(JSON.parse(stored))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Use axiosInstance instead of fetch
      const response = await axiosInstance.post('/login', {
        email,
        password,
      })

      const { token, user: userData } = response.data

      // Store token
      localStorage.setItem('auth_token', token)
      
      // Format and store user
      const formattedUser: User = {
        user_id: userData.user_id,
        email: userData.email,
        name: userData.name,
        department: userData.department || '',
        created_at: userData.created_at,
      }

      setUser(formattedUser)
      localStorage.setItem("user", JSON.stringify(formattedUser))
      
    } catch (error: any) {
      console.error('Login error:', error)
      // Extract error message from Laravel response
      const errorMessage = error.response?.data?.message || 
      error.response?.data?.error || 'Login failed. Please check your credentials.'
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string, department: string) => {
    setIsLoading(true)
    try {
      // Use axiosInstance for registration
      const response = await axiosInstance.post('/register', {
        name,
        email,
        password,
        password_confirmation: password,
        department,
      })

      // Auto-login after successful registration
      //await login(email, password)
      
    } catch (error: any) {
      console.error('Registration error:', error)
      
      // Extract error messages from Laravel validation
      let errorMessage = 'Registration failed'
      
      if (error.response?.data?.errors) {
        // Laravel validation errors object
        const errors = error.response.data.errors
        // Get first error message
        const firstErrorKey = Object.keys(errors)[0]
        errorMessage = errors[firstErrorKey][0]
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      // Use axiosInstance for logout
      await axiosInstance.post('/logout')
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear local state even if API call fails
    } finally {
      // Clear all auth data
      setUser(null)
      localStorage.removeItem("user")
      localStorage.removeItem("auth_token")
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
