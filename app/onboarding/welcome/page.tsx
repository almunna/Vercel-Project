"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function WelcomePage() {
  const [isLogin, setIsLogin] = useState(false) // Default to signup (Get Started)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    fullName: "",
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" })
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user) {
            const fromLogout = sessionStorage.getItem("logout_redirect")
            if (!fromLogout) {
              router.push("/dashboard")
              return
            } else {
              sessionStorage.removeItem("logout_redirect")
            }
          }
        }
      } catch {
        console.log("Not authenticated")
      } finally {
        setCheckingAuth(false)
      }
    }
    checkAuth()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      if (isLogin) {
        console.log("🔐 Attempting login with:", { email: formData.email })

        const response = await fetch("/api/auth/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
          credentials: "include",
        })

        const data = await response.json()
        console.log("🔐 Login response:", data)

        if (data.success) {
          setSuccess("Login successful! Redirecting...")
          sessionStorage.removeItem("logout_redirect")
          setTimeout(() => router.push("/dashboard"), 1000)
        } else {
          setError(data.error || "Login failed")
        }
      } else {
        if (formData.password.length < 8) {
          setError("Password must be at least 8 characters long")
          return
        }

        console.log("📝 Attempting signup with:", {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
        })

        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
          }),
          credentials: "include",
        })

        const data = await response.json()
        console.log("📝 Signup response:", data)

        if (data.success) {
          setSuccess("Account created successfully! Redirecting...")
          setTimeout(() => {
            router.push("/onboarding/step1")
          }, 1000)
        } else {
          setError(data.error || "Registration failed")
        }
      }
    } catch (err) {
      console.error("Auth error:", err)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleModeSwitch = (loginMode: boolean) => {
    setIsLogin(loginMode)
    setError("")
    setSuccess("")
    setFormData({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      fullName: "",
    })
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#BEF397] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Checking authentication...</p>
        </div>
      </div>
    )
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

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-6">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-8"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-[#BEF397] to-[#7DD3FC] rounded-xl flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-black" />
          </div>
          <h1 className="text-[#BEF397] text-4xl font-bold tracking-wide">moulai.</h1>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-md"
        >
          <Card className="bg-zinc-900/60 backdrop-blur-2xl border border-zinc-800/50 shadow-2xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-3xl font-bold text-white">
                {isLogin ? "Welcome Back" : "Create Account"}
              </CardTitle>
              <p className="text-zinc-400 mt-2">
                {isLogin
                  ? "Sign in to continue finding tax deductions"
                  : "Join thousands who've maximized their tax refunds"}
              </p>
            </CardHeader>

            <CardContent className="pt-6">
              {/* Toggle Switch */}
              <div className="mb-8">
                <div className="relative bg-zinc-800/40 backdrop-blur-xl p-1 rounded-2xl border border-zinc-700/50 shadow-2xl">
                  <div className="grid grid-cols-2 gap-0 relative">
                    {/* Sliding background */}
                    <motion.div
                      className="absolute top-1 bottom-1 bg-gradient-to-r from-[#BEF397] to-[#7DD3FC] rounded-xl shadow-lg"
                      initial={false}
                      animate={{
                        x: isLogin ? "100%" : "0%",
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                      style={{
                        width: "calc(50% - 2px)",
                        left: "2px",
                      }}
                    />
                    {/* Buttons */}
                    <button
                      type="button"
                      onClick={() => handleModeSwitch(false)}
                      className={`relative z-10 py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-200 ${
                        !isLogin ? "text-black" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Get Started
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModeSwitch(true)}
                      className={`relative z-10 py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-200 ${
                        isLogin ? "text-black" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isLogin ? "login-form" : "signup-form"}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {!isLogin && (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-white">Full Name</label>
                        <Input
                          name="fullName"
                          type="text"
                          placeholder="Enter your full name"
                          value={formData.fullName || ""}
                          onChange={(e) => {
                            const fullName = e.target.value
                            const names = fullName.trim().split(/\s+/)
                            setFormData({
                              ...formData,
                              fullName: fullName,
                              firstName: names[0] || "",
                              lastName: names.slice(1).join(" ") || "",
                            })
                          }}
                          required
                          className="h-14 bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-[#BEF397] focus:ring-[#BEF397]/20 rounded-xl text-base"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-white">Email address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
                        <Input
                          name="email"
                          type="email"
                          placeholder="Enter your email address"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="pl-12 h-14 bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-[#BEF397] focus:ring-[#BEF397]/20 rounded-xl text-base"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-white">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
                        <Input
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder={isLogin ? "Enter your password" : "Create a secure password (min 8 characters)"}
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          className="pl-12 pr-12 h-14 bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-[#BEF397] focus:ring-[#BEF397]/20 rounded-xl text-base"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Error/Success Messages */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Alert className="border-red-500/50 bg-red-500/10 rounded-xl">
                        <AlertDescription className="text-red-400">{error}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Alert className="border-green-500/50 bg-green-500/10 rounded-xl">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <AlertDescription className="text-green-400">{success}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-[#BEF397] to-[#7DD3FC] text-black hover:shadow-2xl hover:shadow-[#BEF397]/20 transition-all duration-300 disabled:opacity-50 rounded-xl group"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      {isLogin ? "Signing In..." : "Creating Account..."}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      {isLogin ? "Sign In" : "Get Started"}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Button>

                {/* Footer Links */}
                <div className="text-center space-y-4">
                  {isLogin && (
                    <Link
                      href="/forgot-password"
                      className="text-[#BEF397] hover:text-[#BEF397]/80 transition-colors text-sm font-medium"
                    >
                      Forgot your password?
                    </Link>
                  )}

                  {!isLogin && (
                    <div className="text-xs text-zinc-500 leading-relaxed">
                      By creating an account, you agree to our{" "}
                      <a href="#" className="text-[#BEF397] hover:underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-[#BEF397] hover:underline">
                        Privacy Policy
                      </a>
                    </div>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
