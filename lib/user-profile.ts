export interface UserProfile {
  onboarding?: {
    completed: boolean
    step: number
    deductionTypes: string[]
    selectedAccounts: string[]
    completedSteps: number[]
  }
  preferences?: {
    financialYear: {
      start: string
      end: string
    }
    taxRate: number
    currency: string
  }
  settings?: {
    deductionToggles: Record<string, boolean>
    manualOverrides: Record<string, any>
    notifications: boolean
    autoSync: boolean
  }
}

export class UserProfileService {
  private static STORAGE_KEY = "user_profile"

  static getProfile(): UserProfile {
    if (typeof window === "undefined") {
      return {
        onboarding: {
          completed: false,
          step: 1,
          deductionTypes: [],
          selectedAccounts: [],
          completedSteps: [],
        },
        preferences: {
          financialYear: {
            start: "2024-07-01",
            end: "2025-06-30",
          },
          taxRate: 0.3,
          currency: "AUD",
        },
        settings: {
          deductionToggles: {},
          manualOverrides: {},
          notifications: true,
          autoSync: true,
        },
      }
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return {
          onboarding: {
            completed: false,
            step: 1,
            deductionTypes: [],
            selectedAccounts: [],
            completedSteps: [],
            ...parsed.onboarding,
          },
          preferences: {
            financialYear: {
              start: "2024-07-01",
              end: "2025-06-30",
            },
            taxRate: 0.3,
            currency: "AUD",
            ...parsed.preferences,
          },
          settings: {
            deductionToggles: {},
            manualOverrides: {},
            notifications: true,
            autoSync: true,
            ...parsed.settings,
          },
        }
      }
    } catch (error) {
      console.error("Error loading user profile:", error)
    }

    return {
      onboarding: {
        completed: false,
        step: 1,
        deductionTypes: [],
        selectedAccounts: [],
        completedSteps: [],
      },
      preferences: {
        financialYear: {
          start: "2024-07-01",
          end: "2025-06-30",
        },
        taxRate: 0.3,
        currency: "AUD",
      },
      settings: {
        deductionToggles: {},
        manualOverrides: {},
        notifications: true,
        autoSync: true,
      },
    }
  }

  static updateProfile(updates: Partial<UserProfile>): void {
    if (typeof window === "undefined") return

    try {
      const current = this.getProfile()
      const updated = {
        ...current,
        ...updates,
        onboarding: {
          ...current.onboarding,
          ...updates.onboarding,
        },
        preferences: {
          ...current.preferences,
          ...updates.preferences,
        },
        settings: {
          ...current.settings,
          ...updates.settings,
        },
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated))

      // Also save to database if user is authenticated
      this.saveToDatabase(updated)
    } catch (error) {
      console.error("Error updating user profile:", error)
    }
  }

  private static async saveToDatabase(profile: UserProfile): Promise<void> {
    try {
      const response = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ profile }),
      })

      if (!response.ok) {
        console.warn("Failed to save profile to database")
      }
    } catch (error) {
      console.warn("Error saving profile to database:", error)
    }
  }

  static clearProfile(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(this.STORAGE_KEY)
  }
}
