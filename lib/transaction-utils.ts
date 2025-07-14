import type { Transaction } from "./transaction" // Assuming Transaction is defined in another file

export interface Transaction {
  id: string
  description: string
  amount: string
  date: string
  category: string
  subCategory?: string
  account: string
  accountId: string
  accountNumber: string
  type: "debit" | "credit"
  potentialDeduction: boolean
  enriched: boolean
  merchantName?: string
  anzsicDescription?: string
  anzsicCode?: string
  source?: string
  balance?: number
  _basiqData?: any
  isBusinessExpense?: boolean // Added to Transaction interface
  deductionAmount?: number // Added to Transaction interface
  deductionType?: string // Added to Transaction interface
  autoClassified?: boolean // Added to Transaction interface
  aiConfidence?: number // Added to Transaction interface
  classificationSource?: "ai" | "database" | "manual" | "fallback" // Added to Transaction interface
  keywordUsed?: string // Added to Transaction interface
}

export interface ProcessedTransaction {
  id: string
  description: string
  amount: string
  date: string
  category: string
  account: string
  accountId: string
  accountNumber?: string
  type: "debit" | "credit"
  isBusinessExpense: boolean
  deductionAmount: number
  deductionType?: string
  autoClassified: boolean
  source?: string
  balance?: number
  _basiqData?: any
}

export interface ManualOverrides {
  [transactionId: string]: boolean
}

export interface CategoryOverrides {
  [transactionId: string]: string
}

export interface DeductionToggleState {
  [key: string]: boolean
}

export interface CategoryMapping {
  deductionType: string
  categories: string[]
  keywords: string[]
}

export interface MonthlyTrend {
  month: string
  expenses: number
  deductions: number
  savings: number
  count: number
}

export interface CategoryBreakdown {
  category: string
  amount: number
  count: number
  percentage: number
}

export interface QuarterlyData {
  quarter: string
  income: number
  expenses: number
  deductions: number
  netIncome: number
  taxSavings: number
}

export interface CategoryData {
  category: string
  amount: number
  count: number
  percentage: number
  isDeductible: boolean
}

export interface MonthlyData {
  month: string
  income: number
  expenses: number
  deductions: number
  netIncome: number
}

export interface DashboardStats {
  totalTransactions: number
  totalIncome: number
  totalExpenses: number
  deductionAmount: number
  taxSavings: number
  accountsConnected: number
  lastSync: string
}

export interface TaxSummary {
  totalDeductions: number
  potentialSavings: number
  taxableIncome: number
  estimatedTax: number
  effectiveTaxRate: number
  marginalTaxRate: number
}

export class TransactionUtils {

    static getCurrentFinancialYear(): string {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    // Financial year starts in July (month 6)
    // If we're in July 2024 or later, we're in FY 2024-25, so return "2025"
    if (currentMonth >= 6) {
      return (currentYear + 1).toString()
    } else {
      return currentYear.toString()
    }
  }

  static formatFinancialYear(fy: string): string {
    if (!fy) return fy

    // Handle both "FY2025" and "2025" formats
    const year = fy.startsWith("FY") ? Number.parseInt(fy.replace("FY", "")) : Number.parseInt(fy)

    if (isNaN(year)) return fy

    const startYear = year - 1
    const endYear = year.toString().slice(-2)
    const currentFY = this.getCurrentFinancialYear()

    const formattedYear = `${startYear}-${endYear}`

    // Add "(Current)" if this is the current financial year
    if (fy === currentFY || year.toString() === currentFY) {
      return `${formattedYear} (Current)`
    }

    return formattedYear
  }

  static getAvailableFinancialYears(transactions: Transaction[]): string[] {
    const years = new Set<string>()

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date)
      const year = date.getFullYear()
      const month = date.getMonth()

      // Determine financial year
      if (month >= 6) {
        years.add((year + 1).toString())
      } else {
        years.add(year.toString())
      }
    })

    // Always include current and recent financial years
    years.add("2025") // FY 2024-25
    years.add("2024") // FY 2023-24
    years.add("2023") // FY 2022-23
    years.add("2022") // FY 2021-22

    return Array.from(years).sort((a, b) => Number.parseInt(b) - Number.parseInt(a))
  }
  // Deduction type mappings
static readonly DEDUCTION_MAPPINGS: CategoryMapping[] = [
  {
    deductionType: "Vehicles, Travel & Transport",
    categories: ["transport", "fuel", "parking", "travel"],
    keywords: ["fuel", "petrol", "gas", "diesel", "bp", "shell", "caltex", "parking", "toll", "uber", "taxi"],
  },
  {
    deductionType: "Work Tools, Equipment & Technology",
    categories: ["technology", "equipment", "software"],
    keywords: ["computer", "laptop", "software", "microsoft", "adobe", "apple", "tools", "equipment"],
  },
  {
    deductionType: "Work Clothing & Uniforms",
    categories: ["clothing", "uniform"],
    keywords: ["uniform", "clothing", "workwear", "safety", "boots", "helmet"],
  },
  {
    deductionType: "Home Office Expenses",
    categories: ["utilities", "office"],
    keywords: ["electricity", "gas", "internet", "phone", "office", "desk"],
  },
  {
    deductionType: "Education & Training",
    categories: ["education", "training"],
    keywords: ["course", "training", "education", "university", "conference"],
  },
  {
    deductionType: "Professional Memberships & Fees",
    categories: ["membership", "subscriptions", "fees"],
    keywords: ["membership", "association", "subscription", "union", "license", "registration"],
  },
  {
    deductionType: "Meals & Entertainment (Work-Related)",
    categories: ["meals", "entertainment"],
    keywords: ["restaurant", "dining", "cafe", "meal", "lunch", "dinner", "entertainment"],
  },
  {
    deductionType: "Personal Grooming & Wellbeing",
    categories: ["grooming", "wellbeing"],
    keywords: ["haircut", "barber", "massage", "wellbeing", "spa", "beauty"],
  },
  {
    deductionType: "Gifts & Donations",
    categories: ["gifts", "donations"],
    keywords: ["donation", "gift", "charity", "fundraiser", "ngo"],
  },
  {
    deductionType: "Investments, Insurance & Superannuation",
    categories: ["insurance", "superannuation", "investments"],
    keywords: ["insurance", "super", "superannuation", "life insurance", "income protection", "investment"],
  },
  {
    deductionType: "Tax & Accounting Expenses",
    categories: ["tax", "accounting"],
    keywords: ["tax", "accounting", "accountant", "tax agent", "lodgement", "preparation"],
  },
]

  // CENTRALIZED DATA LOADING - Used by all pages
  static async loadAllTransactions(): Promise<ProcessedTransaction[]> {
    try {
      console.log("Loading all transactions from centralized method...")

      // Load PDF transactions from localStorage
      const pdfTransactions = JSON.parse(localStorage.getItem("pdf_transactions") || "[]")
      console.log("PDF transactions loaded:", pdfTransactions.length)

      // Load Basiq transactions if available
      let basiqTransactions: any[] = []
      const userId = localStorage.getItem("basiq_user_id")

      if (userId) {
        try {
          const response = await fetch(`/api/basiq/transactions?userId=${userId}`)
          if (response.ok) {
            const data = await response.json()
            if (data.success && Array.isArray(data.transactions)) {
              basiqTransactions = data.transactions.map((t: any) => ({
                ...t,
                source: "bank-connection",
              }))
              console.log("Basiq transactions loaded:", basiqTransactions.length)
            }
          }
        } catch (error) {
          console.log("No Basiq transactions available:", error)
        }
      }

      // Combine all transactions with consistent logic
      const allTransactions = [
        ...pdfTransactions.map((t: any) => ({
          ...t,
          source: "pdf-upload",
        })),
        ...basiqTransactions,
      ]

      // Remove duplicates and filter for valid transactions
      const uniqueTransactions = allTransactions
        .filter((transaction, index, self) => index === self.findIndex((t) => t.id === transaction.id))
        .filter((transaction) => transaction.balance !== undefined && !isNaN(Number(transaction.balance)))

      console.log("Unique transactions after filtering:", uniqueTransactions.length)

      // Process transactions using consistent logic
      const processedTransactions = this.processTransactions(uniqueTransactions)
      console.log("Processed transactions:", processedTransactions.length)

      return processedTransactions
    } catch (error) {
      console.error("Error loading transactions:", error)
      return []
    }
  }

  // CENTRALIZED USER INCOME - Updated to fetch from database with better error handling
  static async getUserIncome(): Promise<number> {
    try {
      console.log("Attempting to fetch income from database...")

      // First try to get from database
      const response = await fetch("/api/auth/me", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Database response:", data)

        // Check multiple possible locations for salary
        const dbIncome =
          data.user?.profile?.salary ||
          data.user?.profile?.preferences?.salary ||
          data.user?.preferences?.salary ||
          data.user?.salary

        if (dbIncome && dbIncome > 0) {
          console.log("User annual income retrieved from database:", dbIncome)
          return dbIncome
        } else {
          console.log("No valid salary found in database response:", data.user)
        }
      } else {
        console.log("Database fetch failed with status:", response.status)
      }
    } catch (error) {
      console.log("Could not fetch income from database, falling back to localStorage:", error)
    }

    // Fallback to localStorage if database fetch fails
    try {
      const step2Data = JSON.parse(localStorage.getItem("onboarding_step2") || "{}")
      const income = step2Data.annualIncome || 80000
      console.log("User annual income retrieved from localStorage fallback:", income)
      return income
    } catch (error) {
      console.error("Error getting user income from localStorage:", error)
      return 80000
    }
  }

  // CENTRALIZED TAX RATE CALCULATION - Updated to work with async getUserIncome
  static async getUserTaxRate(): Promise<number> {
    const income = await this.getUserIncome()
    let taxRate = 0

    if (income > 180000) taxRate = 45
    else if (income > 120000) taxRate = 37
    else if (income > 45000) taxRate = 32.5
    else if (income > 18200) taxRate = 19
    else taxRate = 0

    console.log(`Tax rate for income ${income}: ${taxRate}%`)
    return taxRate
  }

  // CENTRALIZED DASHBOARD STATS CALCULATION - Updated to work with async getUserIncome
  static async calculateDashboardStats(processedTransactions: ProcessedTransaction[]): Promise<DashboardStats> {
    // Get annual salary from database
    const totalIncome = await this.getUserIncome()

    let totalExpenses = 0
    let deductionAmount = 0

    processedTransactions.forEach((transaction) => {
      const amount = Number.parseFloat(transaction.amount) || 0

      // Only count expenses (negative amounts)
      if (amount < 0) {
        totalExpenses += Math.abs(amount)
        if (transaction.isBusinessExpense) {
          deductionAmount += Math.abs(amount)
        }
      }
    })

    // Calculate tax savings using centralized tax rate
    const taxRate = await this.getUserTaxRate()
    const taxSavings = deductionAmount * (taxRate / 100)

    // Count unique accounts
    const uniqueAccounts = new Set(processedTransactions.map((t) => t.accountId)).size

    const stats = {
      totalTransactions: processedTransactions.length,
      totalIncome, // This is now from the database
      totalExpenses,
      deductionAmount,
      taxSavings,
      accountsConnected: uniqueAccounts,
      lastSync: new Date().toISOString(),
    }

    console.log("Dashboard stats calculated:", stats)
    return stats
  }

  // CENTRALIZED TAX SUMMARY CALCULATION - Updated to work with async methods
  static async calculateTaxSummary(processedTransactions: ProcessedTransaction[]): Promise<TaxSummary> {
    const stats = this.getStats(processedTransactions)
    const userIncome = await this.getUserIncome() // Annual salary from database
    const marginalTaxRate = await this.getUserTaxRate()

    const totalDeductions = stats.totalDeductions
    const potentialSavings = totalDeductions * (marginalTaxRate / 100)
    const taxableIncome = Math.max(0, userIncome - totalDeductions)
    const estimatedTax = this.calculateTax(taxableIncome)
    const effectiveTaxRate = userIncome > 0 ? (estimatedTax / userIncome) * 100 : 0

    const summary = {
      totalDeductions,
      potentialSavings,
      taxableIncome,
      estimatedTax,
      effectiveTaxRate,
      marginalTaxRate,
    }

    console.log("Tax summary calculated:", summary)
    return summary
  }

  // CENTRALIZED TAX CALCULATION
  static calculateTax(taxableIncome: number): number {
    let tax = 0

    if (taxableIncome > 180000) {
      tax += (taxableIncome - 180000) * 0.45
      taxableIncome = 180000
    }
    if (taxableIncome > 120000) {
      tax += (taxableIncome - 120000) * 0.37
      taxableIncome = 120000
    }
    if (taxableIncome > 45000) {
      tax += (taxableIncome - 45000) * 0.325
      taxableIncome = 45000
    }
    if (taxableIncome > 18200) {
      tax += (taxableIncome - 18200) * 0.19
    }

    return tax
  }

  // CENTRALIZED MONTHLY TRENDS CALCULATION - Updated to work with async getUserTaxRate
  static async calculateMonthlyTrends(processedTransactions: ProcessedTransaction[]): Promise<MonthlyTrend[]> {
    const monthlyData = new Map<string, { income: number; expenses: number; deductions: number }>()

    processedTransactions.forEach((transaction) => {
      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const amount = Number.parseFloat(transaction.amount) || 0

      const existing = monthlyData.get(monthKey) || { income: 0, expenses: 0, deductions: 0 }

      if (amount > 0) {
        existing.income += amount
      } else {
        const expenseAmount = Math.abs(amount)
        existing.expenses += expenseAmount
        if (transaction.isBusinessExpense) {
          existing.deductions += expenseAmount
        }
      }

      monthlyData.set(monthKey, existing)
    })

    const taxRate = (await this.getUserTaxRate()) / 100

    return Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) // Last 6 months
      .map(([monthKey, data]) => {
        const [year, month] = monthKey.split("-")
        const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
        const monthLabel = date.toLocaleDateString("en-AU", { month: "short", year: "numeric" })

        return {
          month: monthLabel,
          expenses: data.expenses,
          deductions: data.deductions,
          savings: data.deductions * taxRate,
          count: processedTransactions.filter((t) => {
            const tDate = new Date(t.date)
            return tDate.getFullYear() === Number.parseInt(year) && tDate.getMonth() === Number.parseInt(month) - 1
          }).length,
        }
      })
  }

  // CENTRALIZED CATEGORY BREAKDOWN CALCULATION
  static calculateCategoryBreakdown(processedTransactions: ProcessedTransaction[]): CategoryBreakdown[] {
    const categoryMap = new Map<string, { amount: number; count: number }>()
    let totalDeductionAmount = 0

    processedTransactions.forEach((transaction) => {
      if (transaction.isBusinessExpense) {
        const category = transaction.category || "Other"
        const amount = Math.abs(Number.parseFloat(transaction.amount))
        const existing = categoryMap.get(category) || { amount: 0, count: 0 }
        categoryMap.set(category, {
          amount: existing.amount + amount,
          count: existing.count + 1,
        })
        totalDeductionAmount += amount
      }
    })

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
        percentage: totalDeductionAmount > 0 ? (data.amount / totalDeductionAmount) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
  }

  // Get deduction toggle states from localStorage or initialize from onboarding
  static getDeductionToggles(): DeductionToggleState {
    try {
      // First, try to get from localStorage
      const stored = localStorage.getItem("deduction_toggles")

      // Get user's onboarding selections
      const profile = JSON.parse(localStorage.getItem("user_profile") || "{}")
      const selectedTypes = profile.onboarding?.deductionTypes || []

      console.log("Loading deduction toggles...")
      console.log("Stored toggles:", stored)
      console.log("Onboarding selections:", selectedTypes)

      if (stored) {
        const storedToggles = JSON.parse(stored)

        // Check if we need to sync with onboarding (in case onboarding was updated)
        const hasOnboardingData = selectedTypes.length > 0
        const storedKeys = Object.keys(storedToggles)
        const needsSync = hasOnboardingData && storedKeys.length === 0

        if (needsSync) {
          console.log("Syncing stored toggles with onboarding data...")
          // Initialize from onboarding and save
          const syncedToggles = this.initializeFromOnboarding(selectedTypes)
          this.saveDeductionToggles(syncedToggles)
          return syncedToggles
        }

        return storedToggles
      }

      // No stored toggles, initialize from onboarding
      console.log("No stored toggles found, initializing from onboarding...")
      const initialToggles = this.initializeFromOnboarding(selectedTypes)

      // Save the initial toggles
      this.saveDeductionToggles(initialToggles)

      return initialToggles
    } catch (error) {
      console.warn("Error loading deduction toggles:", error)
      // Fallback to empty state
      return {}
    }
  }

  // Initialize toggles from onboarding selections
  static initializeFromOnboarding(selectedTypes: string[]): DeductionToggleState {
    const toggles: DeductionToggleState = {}

    this.DEDUCTION_MAPPINGS.forEach((mapping) => {
      toggles[mapping.deductionType] = selectedTypes.includes(mapping.deductionType)
    })

    console.log("Initialized toggles from onboarding:", toggles)
    return toggles
  }

  // Save deduction toggle states
  static saveDeductionToggles(toggles: DeductionToggleState): void {
    try {
      localStorage.setItem("deduction_toggles", JSON.stringify(toggles))
      console.log("Saved deduction toggles:", toggles)
    } catch (error) {
      console.error("Error saving deduction toggles:", error)
    }
  }

  // Force refresh toggles from onboarding (useful after onboarding completion)
  static refreshFromOnboarding(): DeductionToggleState {
    try {
      const profile = JSON.parse(localStorage.getItem("user_profile") || "{}")
      const selectedTypes = profile.onboarding?.deductionTypes || []

      console.log("Force refreshing from onboarding:", selectedTypes)

      const refreshedToggles = this.initializeFromOnboarding(selectedTypes)
      this.saveDeductionToggles(refreshedToggles)

      return refreshedToggles
    } catch (error) {
      console.error("Error refreshing from onboarding:", error)
      return {}
    }
  }

  // Auto-classify transaction based on enabled deduction types
  static autoClassifyTransaction(
    transaction: Transaction,
    enabledDeductionTypes: DeductionToggleState,
  ): {
    isDeductible: boolean
    deductionType?: string
    confidence: number
  } {
    // Only classify debits (expenses) as potential deductions
    const amount = Number.parseFloat(transaction.amount || "0")
    if (amount >= 0) return { isDeductible: false, confidence: 0 }

    const description = (transaction.description || "").toLowerCase()
    const category = (transaction.category || "").toLowerCase()
    const merchantName = (transaction.merchantName || "").toLowerCase()
    const anzsicDescription = (transaction.anzsicDescription || "").toLowerCase()

    let bestMatch: { deductionType: string; confidence: number } | null = null

    // Check each deduction type mapping
    for (const mapping of this.DEDUCTION_MAPPINGS) {
      // Skip if this deduction type is not enabled
      if (!enabledDeductionTypes[mapping.deductionType]) continue

      let confidence = 0
      const searchText = `${description} ${category} ${merchantName} ${anzsicDescription}`

      // Check category matches (high confidence)
      for (const cat of mapping.categories) {
        if (category.includes(cat.toLowerCase()) || searchText.includes(cat.toLowerCase())) {
          confidence += 30
        }
      }

      // Check keyword matches (medium confidence)
      for (const keyword of mapping.keywords) {
        if (searchText.includes(keyword.toLowerCase())) {
          confidence += 10
        }
      }

      // Update best match if this is better
      if (confidence > 0 && (!bestMatch || confidence > bestMatch.confidence)) {
        bestMatch = { deductionType: mapping.deductionType, confidence }
      }
    }

    // Return result (require minimum confidence of 20)
    if (bestMatch && bestMatch.confidence >= 20) {
      return {
        isDeductible: true,
        deductionType: bestMatch.deductionType,
        confidence: bestMatch.confidence,
      }
    }

    return { isDeductible: false, confidence: 0 }
  }

  // Manual overrides management
  static getManualOverrides(): ManualOverrides {
    try {
      const stored = localStorage.getItem("manual_overrides")
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.warn("Error loading manual overrides:", error)
      return {}
    }
  }

  static saveManualOverrides(overrides: ManualOverrides): void {
    try {
      localStorage.setItem("manual_overrides", JSON.stringify(overrides))
    } catch (error) {
      console.error("Error saving manual overrides:", error)
    }
  }

  static getCategoryOverrides(): CategoryOverrides {
    try {
      const stored = localStorage.getItem("category_overrides")
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.warn("Error loading category overrides:", error)
      return {}
    }
  }

  static saveCategoryOverrides(overrides: CategoryOverrides): void {
    try {
      localStorage.setItem("category_overrides", JSON.stringify(overrides))
    } catch (error) {
      console.error("Error saving category overrides:", error)
    }
  }

  // Classify transactions using AI
  static async classifyTransactions(
    transactions: Transaction[],
    enabledDeductionTypes: DeductionToggleState,
  ): Promise<Transaction[]> {
    // Filter transactions that need classification (no existing AI data)
    const needsClassification = transactions.filter((t) => !t.aiConfidence)

    if (needsClassification.length === 0) {
      console.log("No transactions need AI classification.")
      return transactions
    }

    console.log(`Classifying ${needsClassification.length} transactions with AI...`)

    try {
      // Prepare data for the API
      const transactionData = needsClassification.map((t) => ({
        id: t.id,
        description: t.description,
        amount: t.amount,
        category: t.category,
        merchantName: t.merchantName,
        anzsicDescription: t.anzsicDescription,
      }))

      // Call the AI classification API
      const response = await fetch("/api/classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transactions: transactionData }),
      })

      if (!response.ok) {
        console.error("AI classification API failed:", response.status, response.statusText)
        return transactions // Return original transactions on failure
      }

      const data = await response.json()

      if (!data.success || !Array.isArray(data.results)) {
        console.error("Invalid AI classification response:", data)
        return transactions // Return original transactions on failure
      }

      // Map results to transactions
      const resultsMap = new Map(data.results.map((r: any) => [r.id, r]))

      const newlyClassified = needsClassification.map((transaction) => {
        const result = resultsMap.get(transaction.id)

        if (result) {
          const amount = Number.parseFloat(transaction.amount.toString()) || 0
          const deductionAmount = result.isDeductible && amount < 0 ? Math.abs(amount) : 0

          return {
            ...transaction,
            isBusinessExpense: result.isDeductible,
            deductionAmount,
            deductionType: result.atoCategory,
            autoClassified: true,
            aiConfidence: result.confidence,
            classificationSource: result.source,
            keywordUsed: result.keywordUsed,
            category: result.atoCategory || transaction.category || "Other",
          }
        } else {
          // FIXED: Check if transaction has merchant/ANZSIC data that indicates it's deductible
          const amount = Number.parseFloat(transaction.amount.toString()) || 0
          let isBusinessExpense = false
          let deductionType: string | undefined
          let deductionAmount = 0

          // Check if transaction has ANZSIC code and merchant data indicating it's deductible
          if (transaction.anzsicCode && transaction.merchantName && amount < 0) {
            // This transaction was processed by merchant lookup but not by AI
            // Check if the ANZSIC code indicates it's deductible based on enabled categories
            const enabledCategories = Object.entries(enabledDeductionTypes)
              .filter(([_, enabled]) => enabled)
              .map(([type, _]) => type)

            // Map ANZSIC codes to deduction categories (this should match your merchant mapping logic)
            const anzsicToCategory: { [key: string]: string } = {
              "4613": "Vehicles, Travel & Transport", // Motor vehicle fuel retailing
              "5920": "Meals & Entertainment (Work-Related)", // Broadcasting and content distribution
              // Add more mappings as needed based on your merchant data
            }

            const mappedCategory = anzsicToCategory[transaction.anzsicCode]
            if (mappedCategory && enabledCategories.includes(mappedCategory)) {
              isBusinessExpense = true
              deductionType = mappedCategory
              deductionAmount = Math.abs(amount)

              console.log(`✅ FIXED: Merchant transaction marked as deductible:`, {
                description: transaction.description,
                merchant: transaction.merchantName,
                anzsicCode: transaction.anzsicCode,
                category: mappedCategory,
                amount: amount,
                deductionAmount: deductionAmount,
              })
            }
          }

          return {
            ...transaction,
            isBusinessExpense,
            deductionAmount,
            deductionType,
            autoClassified: true,
            classificationSource: isBusinessExpense ? ("database" as const) : ("fallback" as const),
            aiConfidence: isBusinessExpense ? 95 : 0,
            category: deductionType || transaction.category || "Other",
          }
        }
      })

      // Merge the newly classified transactions back into the original set
      const updatedTransactions = transactions.map((transaction) => {
        const updatedTransaction = newlyClassified.find((t) => t.id === transaction.id)
        return updatedTransaction ? updatedTransaction : transaction
      })

      console.log(`${updatedTransactions.length} transactions classified.`)
      return updatedTransactions
    } catch (error) {
      console.error("Error classifying transactions:", error)
      return transactions // Return original transactions on error
    }
  }

  private static applyManualOverrides(
    transaction: Transaction,
    manualOverrides: ManualOverrides,
    categoryOverrides: CategoryOverrides,
  ): Transaction {
    const hasManualOverride = manualOverrides.hasOwnProperty(transaction.id)
    const hasCategoryOverride = categoryOverrides.hasOwnProperty(transaction.id)

    let isBusinessExpense = false
    let deductionType: string | undefined

    if (hasCategoryOverride) {
      isBusinessExpense = true
      deductionType = categoryOverrides[transaction.id]
    } else if (hasManualOverride) {
      isBusinessExpense = manualOverrides[transaction.id]
    } else {
      // FIXED: Check if transaction already has merchant/ANZSIC classification
      if (transaction.isBusinessExpense && transaction.deductionType) {
        isBusinessExpense = transaction.isBusinessExpense
        deductionType = transaction.deductionType
      }
    }

    const amount = Number.parseFloat(transaction.amount.toString()) || 0
    const deductionAmount = isBusinessExpense && amount < 0 ? Math.abs(amount) : 0

    return {
      ...transaction,
      isBusinessExpense,
      deductionAmount,
      deductionType,
      category: deductionType || transaction.category || "Other",
      autoClassified: !hasManualOverride && !hasCategoryOverride,
      classificationSource:
        hasManualOverride || hasCategoryOverride ? "manual" : transaction.classificationSource || "fallback",
    }
  }

  // Process transactions with auto-classification and manual overrides
  static async processTransactions(transactions: Transaction[]): Promise<ProcessedTransaction[]> {
    const manualOverrides = this.getManualOverrides()
    const categoryOverrides = this.getCategoryOverrides()
    const deductionToggles = this.getDeductionToggles()

    // Classify transactions using AI
    const classifiedTransactions = await this.classifyTransactions(transactions, deductionToggles)

    return classifiedTransactions.map((transaction) => {
      const processedTransaction = this.applyManualOverrides(transaction, manualOverrides, categoryOverrides)

      return {
        ...processedTransaction,
        isBusinessExpense: processedTransaction.isBusinessExpense || false,
        deductionAmount: processedTransaction.deductionAmount || 0,
        deductionType: processedTransaction.deductionType,
        autoClassified: processedTransaction.autoClassified || false,
      }
    })
  }

  // Get business expenses from processed transactions
  static getBusinessExpenses(transactions: ProcessedTransaction[]): ProcessedTransaction[] {
    return transactions.filter((t) => t.isBusinessExpense)
  }

  // Calculate total deductions
  static getTotalDeductions(transactions: ProcessedTransaction[]): number {
    return transactions.filter((t) => t.isBusinessExpense).reduce((sum, t) => sum + t.deductionAmount, 0)
  }

  // Calculate potential tax savings
  static getPotentialSavings(totalDeductions: number, taxRate: number): number {
    return totalDeductions * taxRate
  }

  // Filter transactions by period
  static filterByPeriod(transactions: ProcessedTransaction[], period: string): ProcessedTransaction[] {
    const now = new Date()
    let startDate: Date

    switch (period) {
      case "30days":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "90days":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case "6months":
        startDate = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000)
        break
      case "ytd":
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        return transactions
    }

    return transactions.filter((t) => new Date(t.date) >= startDate)
  }

  // Filter transactions by category
  static filterByCategory(transactions: ProcessedTransaction[], category: string): ProcessedTransaction[] {
    if (category === "all") return transactions
    return transactions.filter((t) => t.category === category)
  }

  // Get monthly trends
  static getMonthlyTrends(transactions: ProcessedTransaction[], taxRate: number): MonthlyTrend[] {
    const monthlyData = new Map<string, { expenses: number; deductions: number; count: number }>()

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { expenses: 0, deductions: 0, count: 0 })
      }

      const data = monthlyData.get(monthKey)!
      const amount = Math.abs(Number.parseFloat(transaction.amount))

      if (transaction.type === "debit") {
        data.expenses += amount
        data.count += 1
        if (transaction.isBusinessExpense) {
          data.deductions += amount
        }
      }
    })

    return Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, data]) => {
        const [year, month] = monthKey.split("-")
        const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
        const monthLabel = date.toLocaleDateString("en-AU", { year: "numeric", month: "short" })

        return {
          month: monthLabel,
          expenses: data.expenses,
          deductions: data.deductions,
          savings: data.deductions * taxRate,
          count: data.count,
        }
      })
  }

  // Get quarterly data
  static getQuarterlyData(transactions: ProcessedTransaction[], taxRate: number): QuarterlyData[] {
    const quarterlyMap = new Map<string, { income: number; expenses: number; deductions: number }>()

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date)
      const year = date.getFullYear()
      const month = date.getMonth()

      // Determine financial year quarter
      let quarter: string
      let fyYear: number

      if (month >= 6) {
        // July-June financial year
        fyYear = year
        if (month >= 6 && month <= 8) quarter = `FY${fyYear} Q1`
        else if (month >= 9 && month <= 11) quarter = `FY${fyYear} Q2`
        else quarter = `FY${fyYear} Q3`
      } else {
        fyYear = year - 1
        if (month >= 0 && month <= 2) quarter = `FY${fyYear} Q4`
        else if (month >= 3 && month <= 5) quarter = `FY${fyYear} Q4`
        else quarter = `FY${fyYear} Q4`
      }

      const amount = Number.parseFloat(transaction.amount)
      const existing = quarterlyMap.get(quarter) || { income: 0, expenses: 0, deductions: 0 }

      if (amount > 0) {
        existing.income += amount
      } else {
        const expenseAmount = Math.abs(amount)
        existing.expenses += expenseAmount

        if (transaction.isBusinessExpense) {
          existing.deductions += expenseAmount
        }
      }

      quarterlyMap.set(quarter, existing)
    })

    // Calculate tax savings (using dynamic tax rate)
    return Array.from(quarterlyMap.entries())
      .map(([quarter, data]) => ({
        quarter,
        income: data.income,
        expenses: data.expenses,
        deductions: data.deductions,
        netIncome: data.income - data.expenses,
        taxSavings: data.deductions * taxRate,
      }))
      .sort((a, b) => a.quarter.localeCompare(b.quarter))
  }

  // Get category breakdown
  static getCategoryBreakdown(transactions: ProcessedTransaction[]): CategoryBreakdown[] {
    const categoryData = new Map<string, { amount: number; count: number }>()
    const totalAmount = transactions.reduce((sum, t) => sum + t.deductionAmount, 0)

    transactions.forEach((transaction) => {
      if (!transaction.isBusinessExpense) return

      const category = transaction.category
      if (!categoryData.has(category)) {
        categoryData.set(category, { amount: 0, count: 0 })
      }

      const data = categoryData.get(category)!
      data.amount += transaction.deductionAmount
      data.count += 1
    })

    return Array.from(categoryData.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
        percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
  }

  // Get financial year for a transaction
  static getTransactionFinancialYear(dateString: string): string {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = date.getMonth() + 1 // JavaScript months are 0-indexed

    if (month >= 7) {
      return `FY ${year}-${(year + 1).toString().slice(-2)}`
    } else {
      return `FY ${year - 1}-${year.toString().slice(-2)}`
    }
  }

  // Clear all manual overrides
  static clearManualOverrides(): void {
    try {
      localStorage.removeItem("manual_overrides")
    } catch (error) {
      console.error("Error clearing manual overrides:", error)
    }
  }

  // Get statistics - CENTRALIZED VERSION
  static getStats(transactions: ProcessedTransaction[]) {
    const businessExpenses = transactions.filter((t) => t.isBusinessExpense).length
    const totalDeductions = transactions
      .filter((t) => t.isBusinessExpense)
      .reduce((sum, t) => sum + t.deductionAmount, 0)

    // Note: This method is synchronous, so we can't use the async getUserTaxRate here
    // For synchronous contexts, we'll use a default tax rate or require it to be passed in
    const taxRate = 0.325 // Default middle tax bracket
    const potentialSavings = totalDeductions * taxRate

    const stats = {
      totalTransactions: transactions.length,
      businessExpenses,
      totalDeductions,
      potentialSavings,
    }

    console.log("Stats calculated:", stats)
    return stats
  }

  // Additional utility methods
  static filterByDateRange(transactions: Transaction[], startDate: Date, endDate: Date): Transaction[] {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date)
      return transactionDate >= startDate && transactionDate <= endDate
    })
  }

  static filterByFinancialYear(transactions: Transaction[], financialYear: string): Transaction[] {
    const year = Number.parseInt(financialYear)
    const startDate = new Date(year, 6, 1) // July 1st
    const endDate = new Date(year + 1, 5, 30) // June 30th
    return this.filterByDateRange(transactions, startDate, endDate)
  }

  static getCurrentFinancialYear(): string {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    // Financial year starts in July (month 6)
    if (currentMonth >= 6) {
      return currentYear.toString()
    } else {
      return (currentYear - 1).toString()
    }
  }

  static getAvailableFinancialYears(transactions: Transaction[]): string[] {
    const years = new Set<string>()

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date)
      const year = date.getFullYear()
      const month = date.getMonth()

      // Determine financial year
      if (month >= 6) {
        years.add(year.toString())
      } else {
        years.add((year - 1).toString())
      }
    })

    return Array.from(years).sort((a, b) => Number.parseInt(b) - Number.parseInt(a))
  }

  static filterByAccounts(transactions: Transaction[], accountIds: string[]): Transaction[] {
    if (accountIds.length === 0) return transactions
    return transactions.filter((transaction) => accountIds.includes(transaction.accountId))
  }

  static categorizeTransactions(transactions: Transaction[]): CategoryData[] {
    const categoryMap = new Map<string, { amount: number; count: number; isDeductible: boolean }>()

    // Business/deductible categories
    const deductibleCategories = [
      "Office Supplies",
      "Travel",
      "Meals & Entertainment",
      "Professional Services",
      "Software",
      "Equipment",
      "Marketing",
      "Training",
      "Internet",
      "Phone",
      "Fuel",
      "Parking",
      "Tolls",
      "Professional Development",
      "Subscriptions",
      "Business Insurance",
      "Legal Fees",
      "Accounting Fees",
      "Consulting",
      "Advertising",
    ]

    transactions.forEach((transaction) => {
      const category = transaction.category || "Other"
      const amount = Math.abs(Number.parseFloat(transaction.amount))
      const isDeductible = deductibleCategories.includes(category) || transaction.potentialDeduction

      const existing = categoryMap.get(category) || { amount: 0, count: 0, isDeductible }
      categoryMap.set(category, {
        amount: existing.amount + amount,
        count: existing.count + 1,
        isDeductible: isDeductible || existing.isDeductible,
      })
    })

    const totalAmount = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.amount, 0)

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
        percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
        isDeductible: data.isDeductible,
      }))
      .sort((a, b) => b.amount - a.amount)
  }

  static getMonthlyData(transactions: Transaction[]): MonthlyData[] {
    const monthlyMap = new Map<string, { income: number; expenses: number; deductions: number }>()

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const amount = Number.parseFloat(transaction.amount)

      const existing = monthlyMap.get(monthKey) || { income: 0, expenses: 0, deductions: 0 }

      if (amount > 0) {
        existing.income += amount
      } else {
        const expenseAmount = Math.abs(amount)
        existing.expenses += expenseAmount

        if (transaction.potentialDeduction) {
          existing.deductions += expenseAmount
        }
      }

      monthlyMap.set(monthKey, existing)
    })

    return Array.from(monthlyMap.entries())
      .map(([monthKey, data]) => ({
        month: monthKey,
        income: data.income,
        expenses: data.expenses,
        deductions: data.deductions,
        netIncome: data.income - data.expenses,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }

  static getPotentialDeductions(transactions: Transaction[]): Transaction[] {
    return transactions.filter((transaction) => {
      const amount = Number.parseFloat(transaction.amount)
      if (amount >= 0) return false // Only expenses can be deductions

      // Check if already marked as potential deduction
      if (transaction.potentialDeduction) return true

      // Business-related keywords in description
      const businessKeywords = [
        "office",
        "business",
        "professional",
        "work",
        "meeting",
        "conference",
        "training",
        "course",
        "seminar",
        "workshop",
        "software",
        "subscription",
        "fuel",
        "parking",
        "toll",
        "travel",
        "hotel",
        "accommodation",
        "meal",
        "lunch",
        "dinner",
        "coffee",
        "client",
        "equipment",
        "supplies",
        "stationery",
        "internet",
        "phone",
        "mobile",
      ]

      const description = transaction.description.toLowerCase()
      return businessKeywords.some((keyword) => description.includes(keyword))
    })
  }

  static calculateTaxSavings(deductibleAmount: number, taxRate = 0.3): number {
    return deductibleAmount * taxRate
  }

  static getAccountSummary(transactions: Transaction[]): Array<{
    accountId: string
    accountNumber: string
    account: string
    transactionCount: number
    totalIncome: number
    totalExpenses: number
    balance: number
  }> {
    const accountMap = new Map<
      string,
      {
        accountNumber: string
        account: string
        transactionCount: number
        totalIncome: number
        totalExpenses: number
      }
    >()

    transactions.forEach((transaction) => {
      const accountId = transaction.accountId
      const amount = Number.parseFloat(transaction.amount)

      const existing = accountMap.get(accountId) || {
        accountNumber: transaction.accountNumber,
        account: transaction.account,
        transactionCount: 0,
        totalIncome: 0,
        totalExpenses: 0,
      }

      existing.transactionCount++
      if (amount > 0) {
        existing.totalIncome += amount
      } else {
        existing.totalExpenses += Math.abs(amount)
      }

      accountMap.set(accountId, existing)
    })

    return Array.from(accountMap.entries()).map(([accountId, data]) => ({
      accountId,
      accountNumber: data.accountNumber,
      account: data.account,
      transactionCount: data.transactionCount,
      totalIncome: data.totalIncome,
      totalExpenses: data.totalExpenses,
      balance: data.totalIncome - data.totalExpenses,
    }))
  }

  static searchTransactions(transactions: Transaction[], query: string): Transaction[] {
    const searchTerm = query.toLowerCase().trim()
    if (!searchTerm) return transactions

    return transactions.filter((transaction) => {
      return (
        transaction.description.toLowerCase().includes(searchTerm) ||
        transaction.category.toLowerCase().includes(searchTerm) ||
        transaction.account.toLowerCase().includes(searchTerm) ||
        transaction.accountNumber.includes(searchTerm) ||
        Math.abs(Number.parseFloat(transaction.amount)).toString().includes(searchTerm)
      )
    })
  }

  static exportToCSV(transactions: Transaction[]): string {
    const headers = [
      "Date",
      "Description",
      "Amount",
      "Category",
      "Account",
      "Account Number",
      "Type",
      "Potential Deduction",
      "Balance",
    ]

    const rows = transactions.map((transaction) => [
      transaction.date,
      `"${transaction.description.replace(/"/g, '""')}"`,
      transaction.amount,
      transaction.category,
      transaction.account,
      transaction.accountNumber,
      transaction.type,
      transaction.potentialDeduction ? "Yes" : "No",
      transaction.balance?.toString() || "",
    ])

    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
  }
}
