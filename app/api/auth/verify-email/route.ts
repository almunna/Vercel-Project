import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/services/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ success: false, error: "Verification token is required" }, { status: 400 })
    }

    const authService = AuthService.getInstance()
    await authService.verifyEmail(token)

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    })
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to verify email",
      },
      { status: 500 },
    )
  }
}
