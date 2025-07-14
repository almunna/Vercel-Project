"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LayoutDashboard, Receipt } from "lucide-react"
import { cn } from "@/lib/utils"

export function DashboardNavigation() {
  const router = useRouter()
  const pathname = usePathname()

  // Get transaction counts for badges
  const pdfTransactions = JSON.parse(localStorage.getItem("pdf_transactions") || "[]")
  const totalTransactions = pdfTransactions.length

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      label: "Transactions",
      href: "/transactions",
      icon: Receipt,
      active: pathname === "/transactions",
      badge: totalTransactions > 0 ? totalTransactions : undefined,
    },
  ]

  return (
    <div className="flex items-center gap-2 p-4 bg-zinc-900/50 border-b border-zinc-800">
      {navItems.map((item) => (
        <Button
          key={item.href}
          onClick={() => router.push(item.href)}
          variant={item.active ? "default" : "ghost"}
          className={cn(
            "flex items-center gap-2",
            item.active
              ? "bg-[#BEF397] text-black hover:bg-[#BEF397]/90"
              : "text-zinc-300 hover:text-white hover:bg-zinc-800",
          )}
        >
          <item.icon className="w-4 h-4" />
          {item.label}
          {item.badge && (
            <Badge className="bg-[#7DD3FC]/20 text-[#7DD3FC] border-[#7DD3FC]/30 ml-1">{item.badge}</Badge>
          )}
        </Button>
      ))}
    </div>
  )
}
