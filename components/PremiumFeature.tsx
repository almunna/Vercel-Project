"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Crown } from "lucide-react"

export function PremiumFeature({
  children,
  title,
  description,
}: {
  children: React.ReactNode
  title: string
  description: string
}) {
  const [isUpgraded, setIsUpgraded] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" })
        if (response.ok) {
          const data = await response.json()
          if (data.user?.subscription?.plan === "premium") {
            setIsUpgraded(true)
          }
        }
      } catch (error) {
        console.error("Error checking subscription:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  if (loading) {
    // You can customize this skeleton or spinner
    return (
      <div className="h-64 bg-zinc-900 animate-pulse rounded-lg flex items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </div>
    )
  }

  if (isUpgraded) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
        <div className="text-center p-6">
          <Crown className="w-8 h-8 text-[#BEF397] mx-auto mb-3" />
          <h3 className="text-white font-semibold mb-2">{title}</h3>
          <p className="text-zinc-400 text-sm mb-4">{description}</p>
          <Button
            onClick={() => (window.location.href = "/upgrade")}
            className="bg-gradient-to-r from-[#BEF397] to-[#7DD3FC] text-black hover:opacity-90"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade Now
          </Button>
        </div>
      </div>
      <div className="filter blur-sm">{children}</div>
    </div>
  )
}
