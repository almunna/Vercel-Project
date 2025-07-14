import type { ObjectId } from "mongodb"

export interface UserProfile {
  salary?: number
  taxRate?: number
  deductionTypes?: string[]
  preferences?: {
    currency?: string
    dateFormat?: string
    notifications?: boolean
  }
}

export interface UserSubscription {
  plan: "free" | "premium"
  status: "active" | "cancelled" | "expired"
  startDate?: Date
  endDate?: Date
  stripeCustomerId?: string
  stripeSubscriptionId?: string
}

export interface User {
  _id?: ObjectId
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  mobile?: string
  profile?: UserProfile // Make sure this is included
  preferences?: {
    theme?: string
    notifications?: boolean
    currency?: string
  }
  subscription?: UserSubscription
  emailVerified?: boolean
  createdAt: Date
  updatedAt: Date
}

export const defaultUser: Partial<User> = {
  preferences: {
    theme: "dark",
    notifications: true,
    currency: "AUD",
  },
  subscription: {
    plan: "free",
    status: "active",
  },
  profile: {
    salary: 80000, // Default salary
    taxRate: 32.5,
    deductionTypes: [],
  },
  emailVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}
