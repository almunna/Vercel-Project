"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Car,
  Laptop,
  Shirt,
  Home,
  GraduationCap,
  Users,
  Coffee,
  Heart,
  Gift,
  Shield,
  Calculator,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { UserProfileService } from "@/lib/user-profile"
import { TransactionUtils } from "@/lib/transaction-utils"

const deductionOptions = [
  {
    id: "Vehicles, Travel & Transport",
    title: "Vehicles, Travel & Transport",
    description: "Car expenses, fuel, parking, public transport, flights",
    icon: Car,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "Work Tools, Equipment & Technology",
    title: "Work Tools, Equipment & Technology",
    description: "Computers, software, tools, machinery, subscriptions",
    icon: Laptop,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "Work Clothing & Uniforms",
    title: "Work Clothing & Uniforms",
    description: "Uniforms, protective clothing, safety equipment",
    icon: Shirt,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "Home Office Expenses",
    title: "Home Office Expenses",
    description: "Utilities, internet, phone, office supplies, rent portion",
    icon: Home,
    color: "from-orange-500 to-red-500",
  },
  {
    id: "Education & Training",
    title: "Education & Training",
    description: "Courses, conferences, books, professional development",
    icon: GraduationCap,
    color: "from-indigo-500 to-purple-500",
  },
  {
    id: "Professional Memberships & Fees",
    title: "Professional Memberships & Fees",
    description: "Association fees, licenses, certifications",
    icon: Users,
    color: "from-teal-500 to-green-500",
  },
  {
    id: "Meals & Entertainment (Work-Related)",
    title: "Meals & Entertainment (Work-Related)",
    description: "Client meals, business entertainment, work functions",
    icon: Coffee,
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: "Personal Grooming & Wellbeing",
    title: "Personal Grooming & Wellbeing",
    description: "Haircuts, gym memberships, health expenses",
    icon: Heart,
    color: "from-pink-500 to-rose-500",
  },
  {
    id: "Gifts & Donations",
    title: "Gifts & Donations",
    description: "Corporate gifts, charitable donations, sponsorships",
    icon: Gift,
    color: "from-violet-500 to-purple-500",
  },
  {
    id: "Investments, Insurance & Superannuation",
    title: "Investments, Insurance & Superannuation",
    description: "Investment fees, insurance premiums, super contributions",
    icon: Shield,
    color: "from-slate-500 to-gray-500",
  },
  {
    id: "Tax & Accounting Expenses",
    title: "Tax & Accounting Expenses",
    description: "Accountant fees, tax preparation, bookkeeping",
    icon: Calculator,
    color: "from-emerald-500 to-teal-500",
  },
]

export default function OnboardingStep1() {
  const router = useRouter()
  const [selectedDeductions, setSelectedDeductions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load existing selections from user profile (localStorage for now, will be from DB later)
    const profile = UserProfileService.getProfile()
    if (profile.onboarding?.deductionTypes && profile.onboarding.deductionTypes.length > 0) {
      setSelectedDeductions(profile.onboarding.deductionTypes)
    } else {
      // Pre-select all deduction types by default
      const allDeductionIds = deductionOptions.map((option) => option.id)
      setSelectedDeductions(allDeductionIds)
    }
  }, [])

  const toggleDeduction = (deductionId: string) => {
    setSelectedDeductions((prev) =>
      prev.includes(deductionId) ? prev.filter((id) => id !== deductionId) : [...prev, deductionId],
    )
  }

  const handleNext = async () => {
    if (selectedDeductions.length === 0) {
      alert("Please select at least one deduction type to continue.")
      return
    }

    setLoading(true)
    try {
      // Save to database via API
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          onboarding: {
            deductionTypes: selectedDeductions,
            completedSteps: [1],
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save deduction types")
      }

      const result = await response.json()
      console.log("Saved deduction types to database:", selectedDeductions)

      // Also update localStorage for immediate use
      UserProfileService.updateProfile({
        onboarding: {
          ...UserProfileService.getProfile().onboarding,
          deductionTypes: selectedDeductions,
          completedSteps: [1],
        },
      })

      // Initialize auto-classification toggles based on selections
      console.log("Initializing auto-classification toggles...")
      TransactionUtils.refreshFromOnboarding()

      // Navigate to next step
      router.push("/onboarding/step2")
    } catch (error) {
      console.error("Error saving deduction types:", error)
      alert(`There was an error saving your preferences: ${error.message}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push("/onboarding")
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#BEF397] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#7DD3FC] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-[#E5B1FD] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Step 1 of 3</span>
            <span className="text-sm text-zinc-400">33% Complete</span>
          </div>
          <Progress value={33} className="h-2 bg-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-[#BEF397] to-[#7DD3FC] rounded-full transition-all duration-500"
              style={{ width: "33%" }}
            />
          </Progress>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#BEF397] to-[#7DD3FC] rounded-full mb-6">
            <Briefcase className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
            What can you claim?
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Select the types of expenses you typically have. We'll automatically identify potential deductions for you.
          </p>
        </motion.div>

        {/* Deduction Options Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {deductionOptions.map((option, index) => {
            const isSelected = selectedDeductions.includes(option.id)
            const Icon = option.icon

            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                    isSelected
                      ? "bg-gradient-to-br from-zinc-800 to-zinc-900 border-[#BEF397] shadow-lg shadow-[#BEF397]/20"
                      : "bg-zinc-900/50 border-zinc-700 hover:border-zinc-600"
                  }`}
                  onClick={() => toggleDeduction(option.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${option.color} bg-opacity-20`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 bg-[#BEF397] rounded-full flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 text-black" />
                        </motion.div>
                      )}
                    </div>
                    <h3 className="font-semibold text-white mb-2 text-sm leading-tight">{option.title}</h3>
                    <p className="text-zinc-400 text-xs leading-relaxed">{option.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Selected Count */}
        {selectedDeductions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-[#BEF397]/10 border border-[#BEF397]/30 rounded-full px-4 py-2">
              <Check className="w-4 h-4 text-[#BEF397]" />
              <span className="text-[#BEF397] font-medium">
                {selectedDeductions.length} deduction type{selectedDeductions.length !== 1 ? "s" : ""} selected
              </span>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex items-center justify-between max-w-md mx-auto"
        >
          <Button
            onClick={handleBack}
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={selectedDeductions.length === 0 || loading}
            className="bg-gradient-to-r from-[#BEF397] to-[#7DD3FC] text-black font-semibold hover:from-[#BEF397]/90 hover:to-[#7DD3FC]/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              "Saving..."
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </motion.div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-8"
        >
          <p className="text-zinc-500 text-sm">
            Don't worry, you can always change these settings later in your profile.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
