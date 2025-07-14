"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell, Search, User, Settings, CreditCard, LogOut, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export function DashboardHeader() {
  const router = useRouter()
  const [userName, setUserName] = useState("User")
  const [userEmail, setUserEmail] = useState("user@example.com")

  useEffect(() => {
    // Get user data from localStorage
    const name = localStorage.getItem("onboarding_name") || "User"
    const email = localStorage.getItem("onboarding_email") || "user@example.com"
    setUserName(name)
    setUserEmail(email)
  }, [])

  const handleProfileClick = () => {
    router.push("/profile")
  }

  const handleAccountSettingsClick = () => {
    router.push("/settings/account")
  }

  const handleBillingClick = () => {
    router.push("/settings/billing")
  }

  const handleSignOut = () => {
    // Clear all localStorage data
    localStorage.clear()
    // Redirect to home page
    router.push("/")
  }

  return (
    <header className="h-16 border-b border-zinc-800/50 bg-black/50 backdrop-blur-sm flex items-center justify-between px-6">

    </header>
  )
}
