// Transaction field mapping and conventions for PDF statement processing

export interface Transaction {
  // REQUIRED CORE FIELDS
  id: string // Unique identifier (generate UUID if needed)
  date: string // "YYYY-MM-DD" format preferred
  description: string // Full merchant description
  amount: number // NEGATIVE for expenses, POSITIVE for income

  // OPTIONAL FIELDS
  type?: "debit" | "credit" // Transaction type
  category?: string // Auto-categorized (Dining, Transport, etc.)
  balance?: number // Account balance after transaction
  account?: string // Account name/description
  accountId?: string // Account identifier
  accountNumber?: string // Masked account number

  // BUSINESS EXPENSE FIELDS
  isBusinessExpense?: boolean // true/false/undefined
  deductionAmount?: number // POSITIVE amount eligible for deduction
  deductionType?: string // Must match exact deduction category names

  // METADATA
  enriched?: boolean // Whether transaction has been AI-enriched
  source?: string // Source of transaction (e.g., "pdf-upload", "basiq")
  potentialDeduction?: boolean // Quick flag for potential tax deductions
  bankType?: string // Bank type (westpac, amex, cba, nab, anz)
}

// AMOUNT CONVENTION - CRITICAL FOR PROPER DISPLAY
export const AMOUNT_CONVENTIONS = {
  // ✅ CORRECT - Expenses are NEGATIVE
  EXPENSE_EXAMPLE: -67.32, // $67.32 expense at Speedo Café
  INCOME_EXAMPLE: 2500.0, // $2500.00 salary credit

  // ❌ WRONG - Don't use positive for expenses
  WRONG_EXPENSE: 67.32, // This would show as income!
}

// EXACT DEDUCTION TYPE NAMES - Must match onboarding categories
export const DEDUCTION_TYPES = [
  "Work Tools, Equipment & Technology",
  "Vehicles, Travel & Transport",
  "Work Clothing & Uniforms",
  "Home Office Expenses",
  "Education & Training",
  "Professional Memberships & Fees",
  "Meals & Entertainment (Work-Related)",
  "Personal Grooming & Wellbeing",
  "Gifts & Donations",
  "Investments, Insurance & Superannuation",
  "Tax & Accounting Expenses",
] as const

// CATEGORY AUTO-MAPPING
export const CATEGORY_MAPPINGS = {
  Dining: ["cafe", "restaurant", "food", "uber eats", "menulog", "deliveroo"],
  Transport: ["transport", "fuel", "parking", "uber", "taxi", "train", "bus"],
  Software: ["saas", "subscription", "software", "app", "digital", "cloud"],
  Groceries: ["supermarket", "grocery", "woolworths", "coles", "iga"],
  Banking: ["fee", "interest", "charge", "bank", "atm"],
  Retail: ["shop", "store", "retail", "purchase"],
  Other: [], // Default fallback
} as const

// BUSINESS EXPENSE DETECTION KEYWORDS
export const BUSINESS_KEYWORDS = [
  "software",
  "saas",
  "subscription",
  "cloud",
  "hosting",
  "domain",
  "office",
  "equipment",
  "computer",
  "laptop",
  "phone",
  "internet",
  "training",
  "course",
  "conference",
  "seminar",
  "workshop",
  "professional",
  "membership",
  "license",
  "certification",
  "travel",
  "hotel",
  "flight",
  "transport",
  "fuel",
  "parking",
  "meeting",
  "client",
  "business",
  "work",
  "professional",
] as const

// BANK-SPECIFIC PROCESSING HINTS
export const BANK_PROCESSING_HINTS = {
  westpac: {
    dateFormat: "DD/MM/YYYY",
    amountPosition: "right",
    descriptionPattern: /^[A-Z\s]+/,
  },
  amex: {
    dateFormat: "Month DD",
    amountPosition: "right",
    descriptionPattern: /^[A-Z0-9\s]+/,
    hasBalance: false,
    feeSection: "OTHER ACCOUNT TRANSACTIONS",
  },
  cba: {
    dateFormat: "DD MMM YY",
    amountPosition: "right",
    descriptionPattern: /^[A-Z\s]+/,
  },
  nab: {
    dateFormat: "DD/MM/YYYY",
    amountPosition: "right",
    descriptionPattern: /^[A-Z\s]+/,
  },
  anz: {
    dateFormat: "DD/MM/YYYY",
    amountPosition: "right",
    descriptionPattern: /^[A-Z\s]+/,
  },
} as const

// VALIDATION FUNCTIONS
export function validateTransaction(transaction: Partial<Transaction>): string[] {
  const errors: string[] = []

  if (!transaction.id) errors.push("Missing required field: id")
  if (!transaction.date) errors.push("Missing required field: date")
  if (!transaction.description) errors.push("Missing required field: description")
  if (transaction.amount === undefined || transaction.amount === null) {
    errors.push("Missing required field: amount")
  }

  // Validate date format
  if (transaction.date && !isValidDate(transaction.date)) {
    errors.push("Invalid date format. Use YYYY-MM-DD")
  }

  // Validate deduction type
  if (transaction.deductionType && !DEDUCTION_TYPES.includes(transaction.deductionType as any)) {
    errors.push(`Invalid deduction type: ${transaction.deductionType}`)
  }

  return errors
}

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

// HELPER FUNCTIONS
export function categorizeTransaction(description: string): string {
  const desc = description.toLowerCase()

  for (const [category, keywords] of Object.entries(CATEGORY_MAPPINGS)) {
    if (keywords.some((keyword) => desc.includes(keyword))) {
      return category
    }
  }

  return "Other"
}

export function detectBusinessExpense(description: string): boolean {
  const desc = description.toLowerCase()
  return BUSINESS_KEYWORDS.some((keyword) => desc.includes(keyword))
}

export function formatTransactionForStorage(transaction: Transaction): any {
  return {
    id: transaction.id,
    description: transaction.description,
    amount: transaction.amount.toString(), // Store as string for consistency
    date: transaction.date,
    category: transaction.category || "Other",
    account: transaction.account || "PDF Statement",
    accountId: transaction.accountId || "pdf-upload",
    accountNumber: transaction.accountNumber || "****",
    type: transaction.type || (transaction.amount < 0 ? "debit" : "credit"),
    potentialDeduction: transaction.amount < 0, // Expenses are potential deductions
    enriched: transaction.enriched || false,
    source: transaction.source || "pdf-upload",
    balance: transaction.balance,
    bankType: transaction.bankType,
    isBusinessExpense: transaction.isBusinessExpense,
    deductionAmount: transaction.deductionAmount,
    deductionType: transaction.deductionType,
  }
}
