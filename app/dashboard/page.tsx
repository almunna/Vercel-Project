"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  RefreshCw,
  Building2,
  Upload,
  Crown,
  CheckCircle,
  AlertTriangle,
  Shield,
  Calendar,
  Receipt,
  Brain,
  Edit3,
  ChevronRight,
  Star,
  Zap,
  Sparkles,
  TrendingUp,
  Loader2,
  Calculator,
  FileText,
  ArrowRight,
  BarChart3,
  PieChart,
  Activity,
  Wallet,
  Car,
  Shirt,
  Home,
  GraduationCap,
  Coffee,
  Heart,
  Gift,
  Clock,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import {
  TransactionUtils,
  type Transaction,
  type DashboardStats,
  type CategoryBreakdown,
  type MonthlyTrend,
  type DeductionToggleState,
} from "@/lib/transaction-utils"

// ATO Category mapping and definitions
const atoCategories = [
  {
    code: "D1",
    title: "Work-related Car Expenses",
    limit: 5000,
    description: "Vehicle expenses, fuel, parking, tolls",
    icon: Car,
    deductionTypes: ["Vehicles, Travel & Transport"],
    color: "bg-gradient-to-br from-blue-500/30 to-blue-500/20",
    atoUrl:
      "https://www.ato.gov.au/individuals-and-families/your-tax-return/instructions-to-complete-your-tax-return/paper-tax-return-instructions/2024/tax-return/deduction-questions-d1-d10/d1-work-related-car-expenses-2024",
  },
  {
    code: "D2",
    title: "Work-related Travel",
    limit: null,
    description: "Accommodation, meals while traveling for work",
    icon: Coffee,
    deductionTypes: ["Meals & Entertainment (Work-Related)"],
    color: "bg-gradient-to-br from-yellow-500/30 to-yellow-500/20",
    atoUrl:
      "https://www.ato.gov.au/individuals-and-families/your-tax-return/instructions-to-complete-your-tax-return/paper-tax-return-instructions/2023/tax-return/deduction-questions-d1-d10/d2-work-related-travel-expenses-2023",
  },
  {
    code: "D3",
    title: "Clothing & Laundry",
    limit: 300,
    description: "Uniforms, protective clothing, laundry",
    icon: Shirt,
    deductionTypes: ["Work Clothing & Uniforms"],
    color: "bg-gradient-to-br from-green-500/30 to-green-500/20",
    atoUrl:
      "https://www.ato.gov.au/individuals-and-families/your-tax-return/instructions-to-complete-your-tax-return/paper-tax-return-instructions/2023/tax-return/deduction-questions-d1-d10/d3-work-related-clothing-laundry-and-dry-cleaning-expenses-2023",
  },
  {
    code: "D4",
    title: "Self-education",
    limit: null,
    description: "Courses, conferences, training directly related to work",
    icon: GraduationCap,
    deductionTypes: ["Education & Training"],
    color: "bg-gradient-to-br from-indigo-500/30 to-indigo-500/20",
    atoUrl:
      "https://www.ato.gov.au/individuals-and-families/your-tax-return/instructions-to-complete-your-tax-return/paper-tax-return-instructions/2023/tax-return/deduction-questions-d1-d10/d4-work-related-self-education-expenses-2023",
  },
  {
    code: "D5",
    title: "Other Work-related",
    limit: 300,
    description: "Tools, equipment, professional memberships",
    icon: Calculator,
    deductionTypes: [
      "Work Tools, Equipment & Technology",
      "Professional Memberships & Fees",
      "Tax & Accounting Expenses",
    ],
    color: "bg-gradient-to-br from-purple-500/30 to-purple-500/20",
    atoUrl:
      "https://www.ato.gov.au/individuals-and-families/your-tax-return/instructions-to-complete-your-tax-return/paper-tax-return-instructions/2023/tax-return/deduction-questions-d1-d10/d5-other-work-related-expenses-2023",
  },
  {
    code: "D6",
    title: "Home Office",
    limit: null,
    description: "Home office expenses",
    icon: Home,
    deductionTypes: ["Home Office Expenses"],
    color: "bg-gradient-to-br from-orange-500/30 to-orange-500/20",
    atoUrl:
      "https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/deductions-you-can-claim/working-from-home-expenses",
  },
  {
    code: "D7",
    title: "Personal Services",
    limit: null,
    description:
      "https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/deductions-you-can-claim/personal-grooming-health-and-fitness/personal-appearance-and-grooming",
    icon: Heart,
    deductionTypes: ["Personal Grooming & Wellbeing"],
    color: "bg-gradient-to-br from-pink-500/30 to-pink-500/20",
    atoUrl:
      "https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/deductions-you-can-claim/other-work-related-expenses",
  },
  {
    code: "D8",
    title: "Gifts & Donations",
    limit: null,
    description: "Deductible gifts and charitable donations",
    icon: Gift,
    deductionTypes: ["Gifts & Donations"],
    color: "bg-gradient-to-br from-violet-500/30 to-violet-500/20",
    atoUrl:
      "https://www.ato.gov.au/individuals-and-families/your-tax-return/instructions-to-complete-your-tax-return/paper-tax-return-instructions/2023/tax-return/deduction-questions-d1-d10/d9-gifts-or-donations-2023",
  },
  {
    code: "D9",
    title: "Investment & Insurance",
    limit: null,
    description: "Investment management fees, insurance premiums",
    icon: Shield,
    deductionTypes: ["Investments, Insurance & Superannuation"],
    color: "bg-gradient-to-br from-slate-500/30 to-slate-500/20",
    atoUrl:
      "https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/deductions-you-can-claim/investments-insurance-and-super/interest-dividend-and-other-investment-income-deductions",
  },
]

// Helper functions for ATO categories
const mapToATOCategory = (category: string): string => {
  const categoryLower = category.toLowerCase()

  if (
    categoryLower.includes("car") ||
    categoryLower.includes("fuel") ||
    categoryLower.includes("travel") ||
    categoryLower.includes("transport") ||
    categoryLower.includes("vehicle")
  ) {
    return "Work-related Car Expenses"
  }
  if (categoryLower.includes("clothing") || categoryLower.includes("uniform") || categoryLower.includes("laundry")) {
    return "Clothing & Laundry"
  }
  if (
    categoryLower.includes("education") ||
    categoryLower.includes("training") ||
    categoryLower.includes("course") ||
    categoryLower.includes("conference")
  ) {
    return "Self-education"
  }
  if (
    categoryLower.includes("home") ||
    categoryLower.includes("office") ||
    categoryLower.includes("internet") ||
    categoryLower.includes("phone")
  ) {
    return "Home Office"
  }
  if (categoryLower.includes("tool") || categoryLower.includes("equipment") || categoryLower.includes("software")) {
    return "Other Work-related"
  }
  if (categoryLower.includes("gift") || categoryLower.includes("donation") || categoryLower.includes("charity")) {
    return "Gifts & Donations"
  }
  if (
    categoryLower.includes("investment") ||
    categoryLower.includes("property") ||
    categoryLower.includes("interest") ||
    categoryLower.includes("insurance")
  ) {
    return "Investment & Insurance"
  }
  if (categoryLower.includes("meal") || categoryLower.includes("entertainment") || categoryLower.includes("dining")) {
    return "Work-related Travel"
  }

  return "Other Work-related"
}

const getATOCategoryInfo = (atoTitle: string) => {
  return atoCategories.find((cat) => cat.title === atoTitle) || atoCategories[4] // Default to "Other Work-related"
}

const getComplianceStatus = (amount: number, limit: number | null): string => {
  if (!limit) return "compliant"
  if (amount > limit) return "warning"
  if (amount > limit * 0.8) return "caution"
  return "compliant"
}

const getComplianceIcon = (status: string) => {
  switch (status) {
    case "compliant":
      return <CheckCircle className="w-4 h-4 text-green-400" />
    case "caution":
      return <Clock className="w-4 h-4 text-yellow-400" />
    case "warning":
      return <AlertTriangle className="w-4 h-4 text-orange-400" />
    default:
      return <CheckCircle className="w-4 h-4 text-green-400" />
  }
}

const getComplianceColor = (status: string) => {
  switch (status) {
    case "compliant":
      return "text-green-400"
    case "caution":
      return "text-yellow-400"
    case "warning":
      return "text-orange-400"
    default:
      return "text-green-400"
  }
}

const getComplianceMessage = (status: string, limit: number | null) => {
  if (!limit) return "No ATO limit"
  switch (status) {
    case "compliant":
      return "Within ATO guidelines"
    case "caution":
      return `Approaching ${limit.toLocaleString()} limit`
    case "warning":
      return `Evidence may be required.`
    default:
      return "Within ATO guidelines"
  }
}

// Function to group categories by ATO category
const groupByATOCategory = (categoryBreakdown: CategoryBreakdown[]) => {
  const atoGrouped = new Map<
    string,
    {
      amount: number
      count: number
      originalCategories: string[]
      categoryInfo: any
    }
  >()

  categoryBreakdown.forEach((category) => {
    const atoCategory = mapToATOCategory(category.category)
    const categoryInfo = getATOCategoryInfo(atoCategory)

    const existing = atoGrouped.get(atoCategory) || {
      amount: 0,
      count: 0,
      originalCategories: [],
      categoryInfo,
    }

    existing.amount += category.amount
    existing.count += category.count
    existing.originalCategories.push(category.category)

    atoGrouped.set(atoCategory, existing)
  })

  return Array.from(atoGrouped.entries())
    .map(([atoCategory, data]) => ({
      atoCategory,
      amount: data.amount,
      count: data.count,
      originalCategories: data.originalCategories,
      categoryInfo: data.categoryInfo,
    }))
    .sort((a, b) => b.amount - a.amount)
}

export default function DashboardPage() {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [totalFilteredTransactions, setTotalFilteredTransactions] = useState<number>(0)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([])
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([])
  const [loading, setLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [premiumCheckComplete, setPremiumCheckComplete] = useState(false)
  const [reviewComplete, setReviewComplete] = useState(false)
  const [deductionToggles, setDeductionToggles] = useState<DeductionToggleState>({})
  const [selectedFY, setSelectedFY] = useState<string>("FY 2024-25")

  const financialYears = [
    { value: "all", label: "All Years" },
    { value: "FY 2024-25", label: "FY 2024-25 (Current)" },
    { value: "FY 2023-24", label: "FY 2023-24" },
    { value: "FY 2022-23", label: "FY 2022-23" },
  ]

  // Premium check without caching
  const checkPremiumStatus = async (): Promise<boolean> => {
    try {
      console.log("🔍 Checking premium status from API...")
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)

      const res = await fetch("/api/auth/me", {
        credentials: "include",
        signal: controller.signal,
        headers: { "Cache-Control": "no-cache" },
      })

      clearTimeout(timeoutId)

      if (res.ok) {
        const data = await res.json()
        const isPremiumUser = data.user?.subscription?.plan === "premium"
        return isPremiumUser
      }

      return false
    } catch (error) {
      console.log("❌ Premium check failed, defaulting to false")
      return false
    }
  }

  const checkReviewStatus = () => {
    try {
      const reviewStatus = localStorage.getItem("transaction_review_completed")
      setReviewComplete(reviewStatus === "true")
    } catch (error) {
      console.error("Error checking review status:", error)
      setReviewComplete(false)
    }
  }

  // Load dashboard data without caching - always fresh
  const loadDashboardData = async (fy: string = selectedFY, toggles?: DeductionToggleState) => {
    try {
      const currentToggles = toggles || deductionToggles

      setLoading(true)
      setDataLoading(true)
      console.log(`🔄 Loading fresh dashboard data for: ${fy}...`)

      // Always load fresh data
      const allTx = await TransactionUtils.loadAllTransactions(true) // Force fresh load

      let filtered = allTx

      if (fy !== "all") {
        const match = fy.match(/FY (\d{4})-(\d{2})/)
        if (match) {
          const startYear = Number.parseInt(match[1], 10)
          const endYear = Number.parseInt(`${match[1].slice(0, 2)}${match[2]}`, 10)
          const start = new Date(`${startYear}-07-01`)
          const end = new Date(`${endYear}-06-30`)
          filtered = allTx.filter((tx) => {
            const date = new Date(tx.date)
            return date >= start && date <= end
          })
        }
      }

      setTotalFilteredTransactions(filtered.length)
      console.log(`📊 Filtered to ${filtered.length} transactions by date`)

      // Apply deduction filtering logic
      console.log("🔍 Dashboard applying deduction type filter:", {
        enabledTypesCount: Object.values(currentToggles).filter(Boolean).length,
        enabledTypes: Object.entries(currentToggles)
          .filter(([_, enabled]) => enabled)
          .map(([type, _]) => type),
      })

      const deductionFilteredTransactions = filtered.filter((transaction) => {
        let matchesDeductionSettings = true
        if (transaction.isBusinessExpense && transaction.deductionType) {
          matchesDeductionSettings = currentToggles[transaction.deductionType] === true
        }
        return matchesDeductionSettings
      })

      console.log(
        `📊 After deduction type filtering: ${deductionFilteredTransactions.filter((t) => t.isBusinessExpense).length} deductions remain`,
      )

      setAllTransactions(deductionFilteredTransactions)

      // Calculate fresh stats
      const stats = await TransactionUtils.calculateDashboardStats(deductionFilteredTransactions)
      setDashboardStats(stats)

      const breakdown = TransactionUtils.calculateCategoryBreakdown(deductionFilteredTransactions)
      setCategoryBreakdown(breakdown)

      const trends = await TransactionUtils.calculateMonthlyTrends(deductionFilteredTransactions)
      setMonthlyTrends(trends)

      console.log("✅ Dashboard data loaded successfully (no cache)")
    } catch (error) {
      console.error("❌ Error loading dashboard data:", error)
    } finally {
      setDataLoading(false)
      setLoading(false)
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
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const loadDeductionSettings = () => {
    try {
      console.log("🔄 Dashboard loading deduction toggles...")
      const toggles = TransactionUtils.getDeductionToggles()
      console.log("📋 Dashboard loaded deduction toggles:", toggles)
      setDeductionToggles(toggles)
      return toggles
    } catch (error) {
      console.error("❌ Dashboard error loading deduction toggles:", error)
      const fallbackToggles: DeductionToggleState = {}
      const defaultCategories = [
        "Vehicles, Travel & Transport",
        "Work Tools, Equipment & Technology",
        "Home Office Expenses",
        "Professional Memberships & Fees",
        "Education & Training",
        "Work Clothing & Uniforms",
        "Meals & Entertainment (Work-Related)",
        "Tax & Accounting Expenses",
        "Gifts & Donations",
        "Investments, Insurance & Superannuation",
        "Personal Grooming & Wellbeing",
      ]
      defaultCategories.forEach((cat) => {
        fallbackToggles[cat] = true
      })
      setDeductionToggles(fallbackToggles)
      return fallbackToggles
    }
  }

  // Main initialization effect - no caching
  useEffect(() => {
    let mounted = true

    const initializeDashboard = async () => {
      try {
        // Check premium status
        const premiumStatus = await checkPremiumStatus()
        if (!mounted) return

        setIsPremium(premiumStatus)
        setPremiumCheckComplete(true)

        // Check review status
        checkReviewStatus()

        // Load deduction settings
        const toggles = loadDeductionSettings()

        // Load dashboard data (always fresh)
        if (mounted) {
          await loadDashboardData(selectedFY, toggles)
        }
      } catch (error) {
        if (mounted) {
          console.error("Error initializing dashboard:", error)
          setIsPremium(false)
          setPremiumCheckComplete(true)
          setLoading(false)
          setDataLoading(false)
        }
      }
    }

    initializeDashboard()

    // Event listeners for automatic refresh
    const handleForceRefresh = async () => {
      console.log("🔄 Dashboard force refresh triggered")
      if (mounted) {
        await loadDashboardData(selectedFY, deductionToggles)
      }
    }

    const handleTransactionUpdate = () => {
      console.log("🔄 Dashboard transaction update event received")
      handleForceRefresh()
    }

    const handleDeductionSettingsUpdated = () => {
      console.log("🔄 Deduction settings updated, refreshing dashboard")
      const newToggles = loadDeductionSettings()
      loadDashboardData(selectedFY, newToggles)
    }

    const handleSidebarToggle = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.collapsed)
    }

    // Check for refresh flags on mount
    if (localStorage.getItem("force_dashboard_refresh") === "true") {
      console.log("🔄 Force dashboard refresh flag detected")
      localStorage.removeItem("force_dashboard_refresh")
      handleForceRefresh()
    }

    // Add all event listeners
    window.addEventListener("sidebarToggle", handleSidebarToggle as EventListener)
    window.addEventListener("transactionsUpdated", handleTransactionUpdate as EventListener)
    window.addEventListener("dashboardRefresh", handleForceRefresh as EventListener)
    window.addEventListener("forceRefresh", handleForceRefresh as EventListener)
    window.addEventListener("deductionSettingsUpdated", handleDeductionSettingsUpdated as EventListener)

    return () => {
      mounted = false
      window.removeEventListener("sidebarToggle", handleSidebarToggle as EventListener)
      window.removeEventListener("transactionsUpdated", handleTransactionUpdate as EventListener)
      window.removeEventListener("dashboardRefresh", handleForceRefresh as EventListener)
      window.removeEventListener("forceRefresh", handleForceRefresh as EventListener)
      window.removeEventListener("deductionSettingsUpdated", handleDeductionSettingsUpdated as EventListener)
    }
  }, [])

  // Handle financial year changes
  const handleFYChange = async (newFY: string) => {
    setSelectedFY(newFY)
    await loadDashboardData(newFY, deductionToggles)
  }

  // Manual refresh function
  const refreshDashboardData = async () => {
    console.log("🔄 Manual refresh triggered")
    await loadDashboardData(selectedFY, deductionToggles)
  }

  // Debug logging for dashboard stats
  useEffect(() => {
    if (dashboardStats) {
      console.log("🔍 Dashboard Stats Debug:", {
        totalTransactions: dashboardStats.totalTransactions,
        deductionAmount: dashboardStats.deductionAmount,
        taxSavings: dashboardStats.taxSavings,
        totalIncome: dashboardStats.totalIncome,
        totalExpenses: dashboardStats.totalExpenses,
        accountsConnected: dashboardStats.accountsConnected,
      })
    }
  }, [dashboardStats])

  // Debug logging for category breakdown
  useEffect(() => {
    if (categoryBreakdown) {
      console.log("🔍 Category Breakdown Debug:", {
        categoriesFound: categoryBreakdown.length,
        totalAmount: categoryBreakdown.reduce((sum, cat) => sum + cat.amount, 0),
        sampleCategories: categoryBreakdown.slice(0, 3),
        groupedByATO: groupByATOCategory(categoryBreakdown),
      })
    }
  }, [categoryBreakdown])

  if (!premiumCheckComplete || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex">
        <DashboardSidebar />
        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? "ml-20" : "ml-80"
          } flex items-center justify-center`}
        >
          <div className="text-center">
            <div className="relative mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-[#BEF397]/20 to-[#7DD3FC]/20 rounded-3xl flex items-center justify-center mx-auto">
                {!premiumCheckComplete ? (
                  <RefreshCw className="w-10 h-10 animate-spin text-[#BEF397]" />
                ) : (
                  <>
                    <Brain className="w-10 h-10 text-[#BEF397]" />
                    <div className="absolute inset-0 rounded-3xl border-2 border-[#BEF397]/30 animate-pulse" />
                  </>
                )}
              </div>
            </div>
            {!premiumCheckComplete ? (
              <>
                <p className="text-white text-xl font-medium mb-2">Setting things up...</p>
                <p className="text-zinc-400">This will just take a moment</p>
              </>
            ) : (
              <>
                <p className="text-white text-xl font-medium mb-2">Loading your financial overview...</p>
                <p className="text-zinc-400">Analyzing transactions and calculating savings</p>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Group categories by ATO category for display
  const groupedATOCategories = groupByATOCategory(categoryBreakdown)

  return (
    <div className="min-h-screen bg-black text-white flex">
      <DashboardSidebar />
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-80"}`}>
        <DashboardHeader />

        <div className="p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Welcome Header */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-[#BEF397] to-[#7DD3FC] bg-clip-text text-transparent">
                    Welcome Back
                  </h1>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <p className="text-xl text-zinc-300 leading-relaxed">Financial overview for</p>
                  <select
                    value={selectedFY}
                    onChange={(e) => handleFYChange(e.target.value)}
                    className="bg-zinc-800 text-white px-4 py-2 rounded-xl border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#BEF397]"
                    disabled={dataLoading}
                  >
                    {financialYears.map((fy) => (
                      <option key={fy.value} value={fy.value}>
                        {fy.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-3 bg-zinc-900/50 rounded-2xl px-6 py-3 border border-zinc-800/50">
                    <Activity className="w-5 h-5 text-[#BEF397]" />
                    <span className="text-zinc-300 font-medium">{totalFilteredTransactions} transactions</span>
                  </div>
                  <div className="flex items-center gap-3 bg-zinc-900/50 rounded-2xl px-6 py-3 border border-zinc-800/50">
                    <Calendar className="w-5 h-5 text-[#7DD3FC]" />
                    <span className="text-zinc-300 font-medium">
                      {allTransactions.filter((t) => t.isBusinessExpense).length} deductions
                    </span>
                  </div>
                  <button
                    onClick={refreshDashboardData}
                    disabled={dataLoading}
                    className="flex items-center gap-3 bg-zinc-900/50 rounded-2xl px-6 py-3 border border-zinc-800/50 hover:bg-zinc-800/50 transition-all duration-300 disabled:opacity-50"
                  >
                    {dataLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 text-zinc-300 animate-spin" />
                        <span className="text-zinc-300 font-medium">Refreshing...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-5 h-5 text-zinc-300" />
                        <span className="text-zinc-300 font-medium">Refresh</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* AI Review Alert - Only show if review is not complete */}
            {true && (
              <Card className="border-orange-400/30 bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent backdrop-blur-sm rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Brain className="w-6 h-6 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-orange-200">Quick Review Needed</h3>
                        <Badge className="bg-orange-500/20 text-orange-300 px-3 py-1 text-xs rounded-full">
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI Found
                        </Badge>
                      </div>
                      <p className="text-orange-100/90 mb-4 leading-relaxed">
                        Our AI found {allTransactions.filter((t) => t.isBusinessExpense).length} potential tax
                        deductions.
                        <strong className="text-orange-200"> Please review them</strong> to ensure accuracy.
                      </p>
                      <Button
                        onClick={() => (window.location.href = "/transactions")}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2 rounded-xl transition-colors duration-200"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Review Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Premium Upgrade Section */}
            {!isPremium && (
              <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                        <Crown className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">🚀 Upgrade to Premium</h3>
                        <p className="text-zinc-300 text-sm">Unlock unlimited analysis and maximize your tax savings</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => (window.location.href = "/upgrade")}
                      className="bg-purple-600 text-white hover:bg-purple-700 font-semibold px-6"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Transactions */}
              <Card className="group bg-gradient-to-br from-blue-500/15 via-blue-500/8 to-transparent border border-blue-500/30 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/30 to-blue-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Activity className="w-6 h-6 text-blue-400" />
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-300 px-2 py-1 text-xs">This Year</Badge>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-zinc-400 text-sm font-medium">Total Transactions</h3>
                    {dataLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                        <span className="text-lg text-zinc-400">Loading...</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-white">{totalFilteredTransactions}</p>
                        <p className="text-xs text-zinc-500 mt-1">Total uploaded transactions</p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Deductions Found */}
              <Card className="group bg-gradient-to-br from-[#BEF397]/15 via-[#BEF397]/8 to-transparent border border-[#BEF397]/30 hover:border-[#BEF397]/50 transition-all duration-300 hover:scale-105 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#BEF397]/30 to-[#BEF397]/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Receipt className="w-6 h-6 text-[#BEF397]" />
                    </div>
                    <Badge className="bg-[#BEF397]/20 text-[#BEF397] px-2 py-1 text-xs">
                      {allTransactions.filter((t) => t.isBusinessExpense).length} items
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-zinc-400 text-sm font-medium">Deductions Found</h3>
                    {dataLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-[#BEF397]" />
                        <span className="text-lg text-zinc-400">Loading...</span>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-white">
                        {dashboardStats ? formatCurrency(dashboardStats.deductionAmount) : "$0"}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Potential Refund */}
              <Card className="group bg-gradient-to-br from-[#7DD3FC]/15 via-[#7DD3FC]/8 to-transparent border border-[#7DD3FC]/30 hover:border-[#7DD3FC]/50 transition-all duration-300 hover:scale-105 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#7DD3FC]/30 to-[#7DD3FC]/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="w-6 h-6 text-[#7DD3FC]" />
                    </div>
                    <Badge className="bg-[#7DD3FC]/20 text-[#7DD3FC] px-2 py-1 text-xs">Est. Savings</Badge>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-zinc-400 text-sm font-medium">Potential Refund</h3>
                    {dataLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-[#7DD3FC]" />
                        <span className="text-lg text-zinc-400">Loading...</span>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-white">
                        {dashboardStats ? formatCurrency(dashboardStats.taxSavings) : "$0"}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Accounts Connected */}
              <Card className="group bg-gradient-to-br from-purple-500/15 via-purple-500/8 to-transparent border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500/30 to-purple-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Building2 className="w-6 h-6 text-purple-400" />
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-300 px-2 py-1 text-xs">Connected</Badge>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-zinc-400 text-sm font-medium">Accounts</h3>
                    {dataLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                        <span className="text-lg text-zinc-400">Loading...</span>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-white">
                        {dashboardStats ? dashboardStats.accountsConnected : 0}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ATO Categories Analysis - Full Width Section */}
            <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/40 border border-zinc-800/50 backdrop-blur-sm rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#BEF397]/20 to-[#BEF397]/10 rounded-2xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-[#BEF397]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">ATO Categories Breakdown</h2>
                      <p className="text-zinc-400">Official tax deduction categories with compliance status</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-[#BEF397]/20 text-[#BEF397] border-[#BEF397]/30 px-3 py-1">
                      {dataLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Loading...</span>
                        </div>
                      ) : (
                        `${groupedATOCategories.length} active categories`
                      )}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {dataLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-16 h-16 text-[#BEF397] animate-spin mx-auto mb-4" />
                    <p className="text-zinc-400">Analyzing your tax categories...</p>
                  </div>
                ) : groupedATOCategories.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-zinc-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Calculator className="w-8 h-8 text-zinc-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Deductions Found Yet</h3>
                    <p className="text-zinc-400 mb-6">
                      Upload statements or connect accounts to start finding tax deductions
                    </p>
                    <Button
                      onClick={() => (window.location.href = "/upload-statements")}
                      className="bg-[#BEF397] text-black hover:bg-[#BEF397]/90"
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      Get Started
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* ATO Categories Grid - Now properly grouped */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {groupedATOCategories.map((groupedCategory) => {
                        const { atoCategory, amount, count, originalCategories, categoryInfo } = groupedCategory
                        const Icon = categoryInfo.icon
                        const utilizationPercentage = Math.min((amount / (categoryInfo.limit || 1000)) * 100, 100)
                        const complianceStatus = getComplianceStatus(amount, categoryInfo.limit)

                        return (
                          <div
                            key={atoCategory}
                            className="bg-zinc-800/30 rounded-xl border border-zinc-700/50 p-6 hover:bg-zinc-800/50 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className={cn("p-3 rounded-xl", categoryInfo.color)}>
                                  <Icon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h4 className="text-white font-semibold text-sm">{categoryInfo.code}</h4>
                                  <p className="text-zinc-400 text-xs">{atoCategory}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getComplianceIcon(complianceStatus)}
                                <button
                                  onClick={() => window.open(categoryInfo.atoUrl, "_blank")}
                                  className="p-2 bg-zinc-700/50 hover:bg-zinc-600/50 rounded-lg transition-colors duration-200 group"
                                  title="View ATO Documentation"
                                >
                                  <ExternalLink className="w-3 h-3 text-zinc-400 group-hover:text-white transition-colors duration-200" />
                                </button>
                              </div>
                            </div>

                            <div className="space-y-3 mb-4">
                              <div className="flex items-center justify-between">
                                <span className="text-zinc-400 text-sm">Amount Claimed</span>
                                <span className="text-white font-bold">{formatCurrency(amount)}</span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-zinc-400 text-sm">
                                  {categoryInfo.limit ? "ATO Limit" : "Reference Scale"}
                                </span>
                                <span className="text-zinc-300 text-sm">
                                  {categoryInfo.limit ? formatCurrency(categoryInfo.limit) : "No limit"}
                                </span>
                              </div>

                              <div className="w-full bg-zinc-700 rounded-full h-2">
                                <div
                                  className={cn(
                                    "h-2 rounded-full transition-all duration-500",
                                    complianceStatus === "warning" && "bg-orange-500",
                                    complianceStatus === "caution" && "bg-yellow-500",
                                    complianceStatus === "compliant" && "bg-[#BEF397]",
                                  )}
                                  style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                                />
                              </div>
                              <div className="text-xs text-zinc-500 text-right">
                                {categoryInfo.limit
                                  ? `${utilizationPercentage.toFixed(1)}% of limit used`
                                  : `${utilizationPercentage.toFixed(1)}% of $1,000 scale`}
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-zinc-400 text-sm">Transactions</span>
                                <span className="text-zinc-300 text-sm font-medium">{count}</span>
                              </div>

                              {/* Show original categories that were grouped */}
                              {originalCategories.length > 1 && (
                                <div className="pt-2 border-t border-zinc-700/50">
                                  <span className="text-zinc-500 text-xs">Includes:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {originalCategories.slice(0, 3).map((cat, idx) => (
                                      <Badge key={idx} className="bg-zinc-700/50 text-zinc-300 px-2 py-0.5 text-xs">
                                        {cat}
                                      </Badge>
                                    ))}
                                    {originalCategories.length > 3 && (
                                      <Badge className="bg-zinc-700/50 text-zinc-300 px-2 py-0.5 text-xs">
                                        +{originalCategories.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className={cn("text-sm font-medium", getComplianceColor(complianceStatus))}>
                              <span>{getComplianceMessage(complianceStatus, categoryInfo.limit)}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Compliance Overview */}
                    {groupedATOCategories.length > 0 && (
                      <div className="p-6 bg-zinc-800/20 rounded-xl border border-zinc-700/30">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xl font-semibold text-white">Compliance Overview</h4>
                          <Badge className="bg-[#BEF397]/20 text-[#BEF397] border-[#BEF397]/30 px-3 py-1">
                            {
                              groupedATOCategories.filter(
                                (c) => getComplianceStatus(c.amount, c.categoryInfo.limit) === "compliant",
                              ).length
                            }{" "}
                            / {groupedATOCategories.length} categories compliant
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-6 text-center">
                          <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                            <div className="text-2xl font-bold text-green-400 mb-1">
                              {
                                groupedATOCategories.filter(
                                  (c) => getComplianceStatus(c.amount, c.categoryInfo.limit) === "compliant",
                                ).length
                              }
                            </div>
                            <div className="text-sm text-zinc-400">Compliant</div>
                          </div>
                          <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                            <div className="text-2xl font-bold text-yellow-400 mb-1">
                              {
                                groupedATOCategories.filter(
                                  (c) => getComplianceStatus(c.amount, c.categoryInfo.limit) === "caution",
                                ).length
                              }
                            </div>
                            <div className="text-sm text-zinc-400">Approaching Limit</div>
                          </div>
                          <div className="p-4 bg-red-500/10 rounded-xl border border-orange-500/20">
                            <div className="text-2xl font-bold text-orange-400 mb-1">
                              {
                                groupedATOCategories.filter(
                                  (c) => getComplianceStatus(c.amount, c.categoryInfo.limit) === "warning",
                                ).length
                              }
                            </div>
                            <div className="text-sm text-zinc-400">Over Limit</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Tax Categories Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Category Breakdown */}
              <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/40 border border-zinc-800/50 backdrop-blur-sm rounded-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#BEF397]/20 to-[#BEF397]/10 rounded-2xl flex items-center justify-center">
                        <PieChart className="w-6 h-6 text-[#BEF397]" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Tax Categories</h2>
                        <p className="text-zinc-400 text-sm">Top deduction categories</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {categoryBreakdown && categoryBreakdown.length > 0 ? (
                    <div className="space-y-4">
                      {categoryBreakdown.map((category, index) => (
                        <div key={category.category} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "w-3 h-3 rounded-full",
                                  index === 0 && "bg-[#BEF397]",
                                  index === 1 && "bg-[#7DD3FC]",
                                  index === 2 && "bg-purple-400",
                                  index === 3 && "bg-orange-400",
                                  index >= 4 && "bg-zinc-500",
                                )}
                              />
                              <span className="text-white font-medium text-sm">{category.category}</span>
                              <Badge className="bg-zinc-800/50 text-zinc-300 px-2 py-1 text-xs">
                                {category.count} items
                              </Badge>
                            </div>
                            <span className="text-white font-bold text-sm">{formatCurrency(category.amount)}</span>
                          </div>
                          <Progress value={category.percentage} className="h-1.5 rounded-full" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-zinc-800 to-zinc-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <PieChart className="w-8 h-8 text-zinc-500" />
                      </div>
                      <p className="text-zinc-400 text-lg mb-2">No categories found</p>
                      <p className="text-sm text-zinc-500 mb-4 max-w-md mx-auto">
                        Upload statements to see category breakdown
                      </p>
                      <Button
                        onClick={() => (window.location.href = "/upload-statements")}
                        className="bg-gradient-to-r from-[#BEF397] to-[#7DD3FC] hover:from-[#BEF397]/90 hover:to-[#7DD3FC]/90 text-black font-medium"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Statements
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/40 border border-zinc-800/50 backdrop-blur-sm rounded-2xl">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#7DD3FC]/20 to-[#7DD3FC]/10 rounded-2xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-[#7DD3FC]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Quick Actions</h2>
                      <p className="text-zinc-400 text-sm">Manage your tax deductions</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Upload Statements */}
                    <div
                      className="bg-gradient-to-r from-[#BEF397]/10 to-[#BEF397]/5 rounded-xl p-4 border border-[#BEF397]/20 hover:border-[#BEF397]/30 transition-all duration-300 group cursor-pointer"
                      onClick={() => (window.location.href = "/upload-statements")}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#BEF397]/30 to-[#BEF397]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Upload className="w-5 h-5 text-[#BEF397]" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-1">Upload Statements</h4>
                          <p className="text-zinc-400 text-sm">Add bank statements to find more deductions</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#BEF397] group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>

                    {/* Review Transactions */}
                    <div
                      className="bg-gradient-to-r from-orange-500/10 to-orange-500/5 rounded-xl p-4 border border-orange-500/20 hover:border-orange-500/30 transition-all duration-300 group cursor-pointer"
                      onClick={() => (window.location.href = "/transactions")}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500/30 to-orange-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Edit3 className="w-5 h-5 text-orange-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-white">Review Transactions</h4>
                            {!reviewComplete && (
                              <Badge className="bg-orange-500/20 text-orange-300 px-2 py-1 text-xs">Pending</Badge>
                            )}
                          </div>
                          <p className="text-zinc-400 text-sm">
                            {reviewComplete
                              ? "All transactions reviewed and categorized"
                              : `${allTransactions.filter((t) => t.isBusinessExpense).length} deductions need review`}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-orange-400 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>

                    {/* View Tax Analysis */}
                    <div
                      className="bg-gradient-to-r from-[#7DD3FC]/10 to-[#7DD3FC]/5 rounded-xl p-4 border border-[#7DD3FC]/20 hover:border-[#7DD3FC]/30 transition-all duration-300 group cursor-pointer"
                      onClick={() => (window.location.href = "/calculator")}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#7DD3FC]/30 to-[#7DD3FC]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Calculator className="w-5 h-5 text-[#7DD3FC]" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-1">Tax Analysis</h4>
                          <p className="text-zinc-400 text-sm">View detailed ATO-compliant breakdown</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#7DD3FC] group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Trends Chart */}
            {monthlyTrends && monthlyTrends.length > 0 && (
              <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/40 border border-zinc-800/50 backdrop-blur-sm rounded-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#BEF397]/20 to-[#7DD3FC]/20 rounded-2xl flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-[#BEF397]" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Monthly Trends</h2>
                        <p className="text-zinc-400">Last 6 months overview</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {monthlyTrends.map((trend, index) => (
                      <div key={trend.month} className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-white font-medium">{trend.month}</span>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-zinc-400">{formatCurrency(trend.expenses)} expenses</span>
                            <span className="text-[#BEF397]">{formatCurrency(trend.deductions)} deductions</span>
                            <span className="text-[#7DD3FC] font-semibold">
                              {formatCurrency(trend.savings)} savings
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Progress
                            value={trend.expenses > 0 ? (trend.deductions / trend.expenses) * 100 : 0}
                            className="h-2 rounded-full"
                          />
                          <div className="flex justify-between text-xs text-zinc-500">
                            <span>{trend.count} transactions</span>
                            <span>
                              {trend.expenses > 0
                                ? `${((trend.deductions / trend.expenses) * 100).toFixed(1)}% deductible`
                                : "0% deductible"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Transactions */}
            {allTransactions && allTransactions.length > 0 && (
              <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/40 border border-zinc-800/50 backdrop-blur-sm rounded-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-zinc-700/50 to-zinc-600/30 rounded-2xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-zinc-300" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                        <p className="text-zinc-400 text-sm">Latest transactions and deductions</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => (window.location.href = "/transactions")}
                      variant="outline"
                      size="sm"
                      className="border-zinc-700/50 text-zinc-300 hover:bg-zinc-800/50 rounded-xl bg-transparent"
                    >
                      View All
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {allTransactions
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 5)
                      .map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/30 hover:border-zinc-600/50 transition-all duration-300"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-zinc-700 to-zinc-600 rounded-xl flex items-center justify-center">
                              {transaction.source === "pdf-upload" ? (
                                <Upload className="w-5 h-5 text-[#7DD3FC]" />
                              ) : (
                                <Building2 className="w-5 h-5 text-[#BEF397]" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium truncate mb-1">
                                {transaction.description.length > 40
                                  ? `${transaction.description.substring(0, 40)}...`
                                  : transaction.description}
                              </p>
                              <div className="flex items-center gap-3">
                                <span className="text-zinc-400 text-sm">{formatDate(transaction.date)}</span>
                                {transaction.isBusinessExpense && (
                                  <Badge className="bg-[#BEF397]/20 text-[#BEF397] border-[#BEF397]/30 px-2 py-1 text-xs">
                                    <Receipt className="w-3 h-3 mr-1" />
                                    Deductible
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-white font-bold">
                              {formatCurrency(Math.abs(Number.parseFloat(transaction.amount.toString())))}
                            </span>
                            {transaction.isBusinessExpense && (
                              <div className="text-[#BEF397] text-sm">
                                {formatCurrency(
                                  (transaction.deductionAmount ||
                                    Math.abs(Number.parseFloat(transaction.amount.toString()))) * 0.325,
                                )}{" "}
                                saving
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Get Started Section - Show if no transactions */}
            {allTransactions.length === 0 && (
              <Card className="bg-gradient-to-br from-zinc-900/90 to-zinc-800/50 border border-zinc-800/50 backdrop-blur-sm rounded-3xl overflow-hidden">
                <CardContent className="p-12 text-center">
                  <div className="max-w-2xl mx-auto space-y-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#BEF397]/20 to-[#7DD3FC]/20 rounded-3xl flex items-center justify-center mx-auto">
                      <Wallet className="w-12 h-12 text-[#BEF397]" />
                    </div>
                    <div className="space-y-4">
                      <h2 className="text-3xl font-bold text-white">Get Started</h2>
                      <p className="text-zinc-400 text-lg leading-relaxed">
                        Upload your bank statements or connect your bank account to start finding tax deductions
                        automatically.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                      <Button
                        onClick={() => (window.location.href = "/upload-statements")}
                        className="bg-gradient-to-r from-[#BEF397] to-[#7DD3FC] hover:from-[#BEF397]/90 hover:to-[#7DD3FC]/90 text-black font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-[#BEF397]/25 transition-all duration-200"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Upload Statements
                      </Button>
                      <Button
                        onClick={() => (window.location.href = "/upload-statements")}
                        variant="outline"
                        className="border-zinc-700/50 text-zinc-300 hover:bg-zinc-800/50 hover:border-zinc-600/50 px-8 py-4 rounded-xl transition-all duration-200"
                      >
                        <Building2 className="w-5 h-5 mr-2" />
                        Connect Bank
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Premium Upgrade CTA - Show if not premium and has transactions */}
            {!isPremium && allTransactions.length > 0 && (
              <Card className="bg-gradient-to-r from-[#BEF397]/10 to-[#7DD3FC]/10 border border-[#BEF397]/30 rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between flex-wrap gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#BEF397] to-[#7DD3FC] rounded-3xl flex items-center justify-center">
                        <Crown className="w-8 h-8 text-black" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">Unlock Full Potential</h3>
                        <p className="text-zinc-300 max-w-md leading-relaxed">
                          Get unlimited transaction review, advanced analytics, and priority support with Premium.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-[#BEF397] font-bold text-lg">Save hundreds more</div>
                        <div className="text-zinc-400 text-sm">with complete analysis</div>
                      </div>
                      <Button
                        onClick={() => (window.location.href = "/upgrade")}
                        className="bg-gradient-to-r from-[#BEF397] to-[#7DD3FC] hover:from-[#BEF397]/90 hover:to-[#7DD3FC]/90 text-black font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-[#BEF397]/25 transition-all duration-200"
                      >
                        <Crown className="w-5 h-5 mr-2" />
                        Upgrade Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Footer */}
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-2 text-zinc-400 text-sm mb-4">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>Trusted by thousands of Australians for tax deductions</span>
                <Star className="w-4 h-4 text-yellow-400" />
              </div>
              <p className="text-zinc-500 text-sm">
                Data synced {dashboardStats?.lastSync ? formatDate(dashboardStats.lastSync) : "recently"} • Always
                consult a tax professional for advice
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}