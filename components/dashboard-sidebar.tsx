"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Receipt,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Upload,
  User,
  Crown,
  LogOut,
  Sparkles,
  Zap,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface UserProfile {
  id: string
  email: string
  firstName?: string
  lastName?: string
  subscription?: {
    plan: "free" | "premium"
    status: string
  }
}

const navigationItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    description: "Tax deduction details",
  },
  {
    title: "Transactions",
    icon: Receipt,
    href: "/transactions",
    description: "View all transactions",
  },
]

const settingsItems = [
  {
    title: "Profile",
    icon: User,
    href: "/profile",
    description: "Personal information",
  },
  {
    title: "Calculator",
    icon: Calculator,
    href: "/calculator",
    description: "Tax calculator",
  },
]

export function DashboardSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    const controller = new AbortController()
    const forceRefresh = sessionStorage.getItem("forceSidebarRefresh") === "true"
    sessionStorage.removeItem("forceSidebarRefresh")

    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": forceRefresh ? "no-cache" : "max-age=300",
          // Add authorization header if token exists in localStorage
          ...(typeof window !== "undefined" && localStorage.getItem("auth-token")
            ? { Authorization: `Bearer ${localStorage.getItem("auth-token")}` }
            : {}),
        },
      })

      if (response.status === 401) {
        console.log("🔐 Authentication required - redirecting to login")
        // Clear any stale cache
        clearSidebarCache()
        // Redirect to login if not already there
        if (typeof window !== "undefined" && !window.location.pathname.includes("/auth")) {
          window.location.href = "/auth/signin"
        }
        return null
      }

      if (!response.ok) {
        console.error(`❌ API Error: ${response.status} ${response.statusText}`)
        return null
      }

      const data = await response.json()
      if (data.success) {
        setUser(data.user)
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const clearSidebarCache = () => {
    localStorage.removeItem("sidebarData")
  }

  const handleLogout = async () => {
    try {
      sessionStorage.setItem("logout_redirect", "true")
      const response = await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
      })
      if (response.ok) {
        localStorage.removeItem("user_authenticated")
        localStorage.removeItem("user_id")
        localStorage.removeItem("user_email")
        router.push("/")
      }
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const handleToggleCollapse = () => {
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)
    window.dispatchEvent(new CustomEvent("sidebarToggle", { detail: { collapsed: newCollapsed } }))
  }

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  const handleUploadStatements = () => {
    router.push("/upload-statements")
  }

  const handleUpgrade = () => {
    router.push("/upgrade")
  }

  const isPremium = user?.subscription?.plan === "premium"

  // Skeleton component for loading state
  const UserSkeleton = () => (
    <div className="p-4 border-b border-zinc-800/50">
      {!isCollapsed ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-800 rounded-full animate-pulse" />
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-zinc-800 rounded animate-pulse mb-2" />
              <div className="h-3 bg-zinc-800 rounded animate-pulse w-16" />
            </div>
          </div>
          {/* Reserve space for upgrade button */}
          <div className="h-10 bg-zinc-800 rounded-xl animate-pulse" />
          <div className="h-3 bg-zinc-800 rounded animate-pulse w-32 mx-auto" />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-zinc-800 rounded-full animate-pulse" />
          <div className="w-10 h-10 bg-zinc-800 rounded-xl animate-pulse" />
        </div>
      )}
    </div>
  )

  return (
    <div
      className="fixed left-0 top-0 z-40 h-full bg-black border-r border-zinc-800/50 flex flex-col transition-all duration-300 ease-in-out"
      style={{ width: isCollapsed ? "80px" : "280px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-zinc-800/50 min-h-[88px]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#BEF397] to-[#7DD3FC] rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          {!isCollapsed && (
            <h1 className="text-[#BEF397] text-2xl font-bold tracking-tight whitespace-nowrap">moulai.</h1>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleCollapse}
          className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-xl flex-shrink-0"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </Button>
      </div>

      {/* User Status & Upgrade Section - Fixed Height */}
      <div className="min-h-[140px]">
        {loading ? (
          <UserSkeleton />
        ) : user ? (
          <div className="p-4 border-b border-zinc-800/50">
            {!isCollapsed ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#BEF397] to-[#7DD3FC] rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-black" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {isPremium ? (
                        <Badge className="bg-gradient-to-r from-[#BEF397] to-[#7DD3FC] text-black font-semibold text-xs">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-zinc-600 text-zinc-400 text-xs">
                          Free Plan
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Upgrade Button for Non-Premium Users - Fixed Height */}
                <div className="min-h-[52px] flex flex-col justify-center">
                  {!isPremium && (
                    <div>
                      <Button
                        onClick={handleUpgrade}
                        className="w-full bg-gradient-to-r from-[#BEF397] to-[#7DD3FC] hover:from-[#BEF397]/90 hover:to-[#7DD3FC]/90 text-black font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        <span>Upgrade to Premium</span>
                        <Zap className="w-4 h-4 ml-2" />
                      </Button>
                      <p className="text-xs text-zinc-500 text-center mt-2">Unlock unlimited features</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#BEF397] to-[#7DD3FC] rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-black" />
                </div>
                {!isPremium && (
                  <Button
                    onClick={handleUpgrade}
                    size="sm"
                    className="w-10 h-10 p-0 bg-gradient-to-r from-[#BEF397] to-[#7DD3FC] hover:from-[#BEF397]/90 hover:to-[#7DD3FC]/90 text-black rounded-xl"
                    title="Upgrade to Premium"
                  >
                    <Crown className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : (
          <UserSkeleton />
        )}
      </div>

      {/* Upload Statements Button - Fixed Height */}
      <div className="p-4 border-b border-zinc-800/50 min-h-[72px] flex items-center">
        <Button
          onClick={handleUploadStatements}
          className={cn(
            "w-full bg-gradient-to-r from-[#BEF397] to-[#7DD3FC] hover:from-[#BEF397]/90 hover:to-[#7DD3FC]/90 text-black font-semibold rounded-xl transition-all duration-200 flex items-center justify-center",
            isCollapsed ? "px-0" : "px-4",
          )}
        >
          <Upload className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="ml-2 whitespace-nowrap">Upload Statements</span>}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 group",
                  isActive
                    ? "bg-gradient-to-r from-[#BEF397]/20 to-[#7DD3FC]/20 text-white border border-[#BEF397]/30"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50",
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0",
                    isActive ? "text-[#BEF397]" : "text-zinc-400 group-hover:text-white",
                  )}
                />
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-zinc-500 group-hover:text-zinc-400">{item.description}</div>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Settings */}
        <div className="pt-6 border-t border-zinc-800/50">
          {!isCollapsed && (
            <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Settings</div>
          )}
          <div className="space-y-1">
            {settingsItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <button
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 group",
                    isActive
                      ? "bg-gradient-to-r from-[#BEF397]/20 to-[#7DD3FC]/20 text-white border border-[#BEF397]/30"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50",
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 flex-shrink-0",
                      isActive ? "text-[#BEF397]" : "text-zinc-400 group-hover:text-white",
                    )}
                  />
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-zinc-500 group-hover:text-zinc-400">{item.description}</div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Logout - Fixed Height */}
      <div className="p-4 border-t border-zinc-800/50 min-h-[72px] flex items-center">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className={cn(
            "w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center",
            isCollapsed ? "justify-center px-2" : "justify-start",
          )}
        >
          <LogOut className={cn("w-5 h-5 flex-shrink-0", !isCollapsed && "mr-3")} />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  )
}
