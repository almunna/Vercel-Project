"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User } from "../models/user"

interface AuthContextType {
  user: User | null
  loading: boolean
  signin: (email: string, password: string) => Promise<void>
  signup: (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
  }) => Promise<void>
  signout: () => Promise<void>
  updateUser: (updates: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const signin = async (email: string, password: string) => {
    const response = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Signin failed")
    }

    const data = await response.json()
    setUser(data.user)
  }

  const signup = async (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
  }) => {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Signup failed")
    }

    const data = await response.json()
    setUser(data.user)
  }

  const signout = async () => {
    await fetch("/api/auth/signout", { method: "POST" })
    setUser(null)
  }

  const updateUser = async (updates: Partial<User>) => {
    const response = await fetch("/api/auth/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })

    if (response.ok) {
      const data = await response.json()
      setUser(data.user)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signin,
        signup,
        signout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
