"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function OnboardingPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to step1 (deduction selection)
    router.push("/onboarding/step1")
  }, [router])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#BEF397] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h1 className="text-white text-base sm:text-lg">Starting your onboarding...</h1>
      </div>
    </div>
  )
}
