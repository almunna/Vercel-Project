"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, DollarSign, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Australian tax brackets for 2023-24
const TAX_BRACKETS = [
  { min: 0, max: 18200, rate: 0, description: "Tax-free threshold" },
  { min: 18201, max: 45000, rate: 0.19, description: "19% tax rate" },
  { min: 45001, max: 120000, rate: 0.325, description: "32.5% tax rate" },
  { min: 120001, max: 180000, rate: 0.37, description: "37% tax rate" },
  { min: 180001, max: Number.POSITIVE_INFINITY, rate: 0.45, description: "45% tax rate" },
]

export default function OnboardingStep2() {
  const router = useRouter()
  const [salary, setSalary] = useState("")
  const [formattedSalary, setFormattedSalary] = useState("")
  const [taxBracket, setTaxBracket] = useState<(typeof TAX_BRACKETS)[0] | null>(null)
  const [estimatedTax, setEstimatedTax] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const numericSalary = Number.parseFloat(salary.replace(/[,$]/g, ""))
    if (!isNaN(numericSalary) && numericSalary > 0) {
      // Find tax bracket
      const bracket = TAX_BRACKETS.find((bracket) => numericSalary >= bracket.min && numericSalary <= bracket.max)
      setTaxBracket(bracket || null)

      // Calculate estimated tax
      let tax = 0
      for (const bracket of TAX_BRACKETS) {
        if (numericSalary > bracket.min) {
          const taxableInBracket = Math.min(numericSalary, bracket.max) - bracket.min + 1
          tax += taxableInBracket * bracket.rate
        }
      }
      setEstimatedTax(tax)
    } else {
      setTaxBracket(null)
      setEstimatedTax(0)
    }
  }, [salary])

  const formatCurrency = (value: string) => {
    // Remove all non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, "")

    // Parse as number and format with commas
    const number = Number.parseFloat(numericValue)
    if (isNaN(number)) return ""

    return new Intl.NumberFormat("en-AU", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number)
  }

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSalary(value.replace(/[,$]/g, ""))
    setFormattedSalary(formatCurrency(value))
  }

  const handleContinue = async () => {
    if (!salary || Number.parseFloat(salary) <= 0) {
      setError("Please enter a valid salary amount")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      console.log("Attempting to save profile...")

      // First check if we're authenticated
      const authCheck = await fetch("/api/auth/me", {
        credentials: "include",
      })

      console.log("Auth check response:", authCheck.status)

      if (!authCheck.ok) {
        throw new Error("Authentication required. Please log in again.")
      }

      // Save salary to database using the correct endpoint
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // This ensures cookies are sent
        body: JSON.stringify({
          salary: Number.parseFloat(salary),
          taxBracket: taxBracket?.rate || 0,
          estimatedTax,
        }),
      })

      console.log("Profile update response:", response.status)

      const data = await response.json()

      if (!response.ok) {
        console.error("Response not ok:", response.status, data)
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to save profile")
      }

      console.log("Profile saved successfully:", data)

      // Also save to localStorage for immediate access
      const profileData = {
        salary: Number.parseFloat(salary),
        taxBracket: taxBracket?.rate || 0,
        estimatedTax,
        completedAt: new Date().toISOString(),
      }

      localStorage.setItem("user_profile", JSON.stringify(profileData))

      // Redirect to upload-statements
      router.push("/find-deductions")
    } catch (error) {
      console.error("Error saving profile:", error)
      setError(error instanceof Error ? error.message : "Failed to save profile. Please try again.")

      // If authentication failed, redirect to login
      if (error instanceof Error && error.message.includes("Authentication")) {
        router.push("/auth/signin")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.push("/onboarding/step1")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-[#BEF397]/10 to-[#7DD3FC]/10 blur-xl"
            style={{
              width: `${150 + Math.random() * 100}px`,
              height: `${150 + Math.random() * 100}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 30, -30, 0],
              y: [0, -30, 30, 0],
              scale: [1, 1.1, 0.9, 1],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Button
            onClick={handleBack}
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#BEF397] to-[#7DD3FC] rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-[#BEF397] text-3xl font-bold tracking-wide">moulai.</h1>
          </div>
          <div className="w-20" />
        </motion.div>

        {/* Progress indicator */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Step 2 of 2</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2">
            <motion.div
              initial={{ width: "50%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-r from-[#BEF397] to-[#7DD3FC] h-2 rounded-full"
            />
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 max-w-2xl mx-auto w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-zinc-900/60 backdrop-blur-2xl border border-zinc-800/50 shadow-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-white mb-4">Income Information</CardTitle>
                <p className="text-zinc-400 text-lg">
                  Enter your annual salary to calculate your tax bracket and potential deductions
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Error Alert */}
                {error && (
                  <Alert className="border-red-800 bg-red-900/20">
                    <AlertDescription className="text-red-300">{error}</AlertDescription>
                  </Alert>
                )}

                {/* Salary Input */}
                <div className="space-y-2">
                  <Label htmlFor="salary" className="text-white font-medium">
                    Annual Salary (AUD)
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
                    <Input
                      id="salary"
                      type="text"
                      value={formattedSalary}
                      onChange={handleSalaryChange}
                      placeholder="Enter your annual salary"
                      className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder-zinc-400 focus:border-[#BEF397] focus:ring-[#BEF397]/20 text-lg h-14"
                    />
                  </div>
                  <p className="text-sm text-zinc-500">
                    This helps us calculate your tax bracket and identify relevant deductions
                  </p>
                </div>

                {/* Tax Bracket Information */}
                {taxBracket && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-gradient-to-r from-[#BEF397]/10 to-[#7DD3FC]/10 rounded-xl border border-[#BEF397]/20"
                  >
                    <h3 className="text-lg font-semibold text-white mb-4">Your Tax Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-zinc-400">Tax Bracket</p>
                        <p className="text-xl font-bold text-[#BEF397]">
                          {taxBracket.rate === 0 ? "Tax-free" : `${(taxBracket.rate * 100).toFixed(1)}%`}
                        </p>
                        <p className="text-xs text-zinc-500">{taxBracket.description}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-zinc-400">Estimated Annual Tax</p>
                        <p className="text-xl font-bold text-[#7DD3FC]">
                          ${estimatedTax.toLocaleString("en-AU", { maximumFractionDigits: 0 })}
                        </p>
                        <p className="text-xs text-zinc-500">Before deductions</p>
                      </div>
                    </div>
                  </motion.div>
                )}



                {/* Info Alert */}
                <Alert className="border-blue-800 bg-blue-900/20">
                  <AlertDescription className="text-blue-300">
                    <strong>Note:</strong> Tax calculations are estimates based on 2023-24 Australian tax brackets.
                    Actual tax may vary based on other factors like Medicare levy, deductions, and offsets.
                  </AlertDescription>
                </Alert>

                {/* Continue Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="pt-6"
                >
                  <Button
                    onClick={handleContinue}
                    disabled={!salary || Number.parseFloat(salary) <= 0 || isLoading}
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-[#BEF397] to-[#7DD3FC] text-black hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Saving..." : "Continue to Upload Statements"}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
