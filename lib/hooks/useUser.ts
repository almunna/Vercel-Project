"use client"

import { useState, useEffect } from "react"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  profile: {
    onboarding: {
      completed: boolean
      step: number
      deductionTypes: string[]
      selectedAccounts: string[]
      completedSteps: number[]
    }
    preferences: {
      financialYear: {
        start: string
        end: string
      }
      taxRate: number
      currency: string
    }
  }
  subscription: {
    plan: "free" | "premium"
    status: "active" | "cancelled" | "expired"
  }
  settings: {
    deductionToggles: Record<string, boolean>
    manualOverrides: Record<string, any>
    notifications: boolean
    autoSync: boolean
  }
  isEmailVerified: boolean
  basiqUserId?: string
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch user")
      }

      const data = await response.json()
      if (data.success) {
        setUser(data.user)
        setError(null)
      } else {
        throw new Error(data.error || "Failed to fetch user")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      console.error("Error fetching user:", err)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const response = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      const data = await response.json()
      if (data.success) {
        setUser(data.user)
        return data.user
      } else {
        throw new Error(data.error || "Failed to update profile")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      throw err
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return {
    user,
    loading,
    error,
    fetchUser,
    updateProfile,
    refetch: fetchUser,
  }
}
