"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  Crown,
  Sparkles,
  ArrowRight,
  Gift,
  Download,
  BarChart3,
  Users,
  Calendar,
  Target,
  Zap,
} from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { TransactionUtils } from "@/lib/transaction-utils"

export default function UpgradeSuccessPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [planType, setPlanType] = useState<"ai" | "cpa" | null>(null)
  const [upgrade, setUpgrade] = useState<{
    date: string
    status: string
    planType: string
  } | null>(null)
  const [userStats, setUserStats] = useState({
    deductionAmount: 0,
    taxSavings: 0,
    potentialRefund: 0,
    userIncome: 80000,
  })
  const [updating, setUpdating] = useState(true)

  useEffect(() => {
    loadUpgradeInfo()
    loadUserStats()

    // Listen for sidebar state changes
    const handleSidebarToggle = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.collapsed)
    }

    window.addEventListener("sidebarToggle", handleSidebarToggle as EventListener)

    return () => {
      window.removeEventListener("sidebarToggle", handleSidebarToggle as EventListener)
    }
  }, [])

  const loadUpgradeInfo = async () => {
    try {
      setUpdating(true)

      const status = localStorage.getItem("upgrade_status")
      const planType = localStorage.getItem("plan_type") as "ai" | "cpa"
      const upgradeDate = localStorage.getItem("upgrade_date")

      if (status && planType && upgradeDate) {
        setUpgrade({
          status,
          planType,
          date: upgradeDate,
        })
        setPlanType(planType)

        // Update subscription in database
        await updateSubscriptionInDatabase(planType, upgradeDate)
      }
    } catch (error) {
      console.error("Error loading upgrade info:", error)
    } finally {
      setUpdating(false)
    }
  }

  const updateSubscriptionInDatabase = async (planType: string, upgradeDate: string) => {
    try {
      console.log("Updating subscription in database...")

      const response = await fetch("/api/auth/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          plan: "premium",
          planType: planType,
          status: "active",
          upgradeDate: upgradeDate,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log("Subscription updated successfully:", data)

        // Clear localStorage after successful database update
        localStorage.removeItem("upgrade_status")
        localStorage.removeItem("plan_type")
        localStorage.removeItem("upgrade_date")
      } else {
        console.error("Failed to update subscription:", data.error)
      }
    } catch (error) {
      console.error("Error updating subscription:", error)
    }
  }

  const loadUserStats = async () => {
    try {
      // Load transactions using centralized method
      const processedTransactions = await TransactionUtils.loadAllTransactions()

      // Calculate stats using centralized methods
      const stats = await TransactionUtils.calculateDashboardStats(processedTransactions)
      const taxSummary = await TransactionUtils.calculateTaxSummary(processedTransactions)

      // Get user income from database
      const userIncome = await TransactionUtils.getUserIncome()

      // Calculate potential refund (tax savings + estimated additional refund)
      const potentialRefund = stats.taxSavings + stats.taxSavings * 0.3 // Add 30% buffer for premium optimizations

      setUserStats({
        deductionAmount: stats.deductionAmount,
        taxSavings: stats.taxSavings,
        potentialRefund,
        userIncome,
      })
    } catch (error) {
      console.error("Error loading user stats:", error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getPlanName = (type: string) => {
    return type === "ai" ? "AI Smart Review" : "CPA Professional Review"
  }

  const getPlanIcon = (type: string) => {
    return type === "ai" ? <Sparkles className="w-6 h-6" /> : <Users className="w-6 h-6" />
  }

  const getPlanColor = (type: string) => {
    return type === "ai" ? "from-[#BEF397] to-[#7DD3FC]" : "from-[#7DD3FC] to-purple-500"
  }

  const getNextSteps = (type: string) => {
    if (type === "ai") {
      return [
        {
          title: "Access Premium Features",
          description: "All advanced features are now unlocked",
          icon: <Zap className="w-5 h-5" />,
          action: "Go to Dashboard",
          href: "/dashboard",
        },
        {
          title: "Generate Reports",
          description: "Export detailed tax reports and summaries",
          icon: <BarChart3 className="w-5 h-5" />,
          action: "View Reports",
          href: "/reports",
        },
        {
          title: "Review Tax Details",
          description: "See your complete tax breakdown",
          icon: <Target className="w-5 h-5" />,
          action: "View Tax Details",
          href: "/tax-details",
        },
      ]
    } else {
      return [
        {
          title: "Schedule Consultation",
          description: "Book your personal CPA consultation call",
          icon: <Calendar className="w-5 h-5" />,
          action: "Schedule Call",
          href: "/contact-cpa",
        },
        {
          title: "Access Premium Features",
          description: "All advanced features are now unlocked",
          icon: <Zap className="w-5 h-5" />,
          action: "Go to Dashboard",
          href: "/dashboard",
        },
        {
          title: "Generate Reports",
          description: "Export detailed tax reports and summaries",
          icon: <BarChart3 className="w-5 h-5" />,
          action: "View Reports",
          href: "/reports",
        },
      ]
    }
  }

  if (!upgrade || updating) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#BEF397]/30 border-t-[#BEF397] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">
            {updating ? "Activating your premium features..." : "Loading upgrade information..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      <DashboardSidebar />
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-80"}`}>
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">Upgrade Successful! 🎉</h1>
              <p className="text-xl text-zinc-300 mb-2">Welcome to {getPlanName(upgrade.planType)}</p>
              <p className="text-zinc-400">Your premium features are now active and ready to use</p>
            </div>

            {/* Upgrade Summary */}
            <Card className={`bg-gradient-to-br ${getPlanColor(upgrade.planType)}/10 border border-current/30 mb-8`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${getPlanColor(upgrade.planType)} rounded-lg flex items-center justify-center text-black`}
                    >
                      {getPlanIcon(upgrade.planType)}
                    </div>
                    <div>
                      <CardTitle className="text-white text-xl">{getPlanName(upgrade.planType)}</CardTitle>
                      <p className="text-zinc-400 text-sm">Activated on {formatDate(upgrade.date)}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-black/20 rounded-lg">
                    <p className="text-sm text-zinc-400 mb-1">Deductions Found</p>
                    <p className="text-2xl font-bold text-[#BEF397]">{formatCurrency(userStats.deductionAmount)}</p>
                  </div>
                  <div className="text-center p-4 bg-black/20 rounded-lg">
                    <p className="text-sm text-zinc-400 mb-1">Tax Savings</p>
                    <p className="text-2xl font-bold text-[#7DD3FC]">{formatCurrency(userStats.taxSavings)}</p>
                  </div>
                  <div className="text-center p-4 bg-black/20 rounded-lg">
                    <p className="text-sm text-zinc-400 mb-1">Potential Refund</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(userStats.potentialRefund)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What's New */}
            <Card className="bg-zinc-900/60 border border-zinc-800 mb-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Gift className="w-5 h-5 text-[#BEF397]" />
                  What's Now Available
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-zinc-300">Unlimited transaction analysis</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-zinc-300">Advanced filtering & categorization</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-zinc-300">Detailed reports & analytics</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-zinc-300">Export to PDF, CSV, Excel</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-zinc-300">Monthly trends analysis</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-zinc-300">Category breakdown charts</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-zinc-300">Tax optimization suggestions</span>
                    </div>
                    {upgrade.planType === "cpa" && (
                      <div className="flex items-center gap-3">
                        <Crown className="w-5 h-5 text-[#7DD3FC] flex-shrink-0" />
                        <span className="text-zinc-300">Personal CPA consultation</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="bg-zinc-900/60 border border-zinc-800 mb-8">
              <CardHeader>
                <CardTitle className="text-white">Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getNextSteps(upgrade.planType).map((step, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-700 rounded-lg flex items-center justify-center text-[#BEF397]">
                          {step.icon}
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{step.title}</h4>
                          <p className="text-zinc-400 text-sm">{step.description}</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => (window.location.href = step.href)}
                        className="bg-gradient-to-r from-[#BEF397] to-[#7DD3FC] text-black hover:opacity-90"
                      >
                        {step.action}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Support & Resources */}
            <Card className="bg-zinc-900/60 border border-zinc-800 mb-8">
              <CardHeader>
                <CardTitle className="text-white">Support & Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white font-medium mb-3">Get Help</h4>
                    <div className="space-y-2">
                      <p className="text-zinc-400 text-sm">
                        Need assistance? Our support team is here to help you make the most of your premium features.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
                        >
                          Email Support
                        </Button>
                        {upgrade.planType === "cpa" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
                          >
                            Phone Support
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-3">Resources</h4>
                    <div className="space-y-2">
                      <p className="text-zinc-400 text-sm">
                        Access guides, tutorials, and best practices to maximize your tax deductions.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          User Guide
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
                        >
                          Tax Tips
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <div className="text-center">
              <Button
                onClick={() => (window.location.href = "/dashboard")}
                className="bg-gradient-to-r from-[#BEF397] to-[#7DD3FC] text-black hover:opacity-90 text-lg px-8 py-3"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Start Using Premium Features
              </Button>
              <p className="text-zinc-500 text-sm mt-4">
                Your premium features are active and ready to help you maximize your tax refund
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
