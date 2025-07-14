import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/services/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, newPassword } = body

    if (!token || !newPassword) {
      return NextResponse.json({ success: false, error: "Token and new password are required" }, { status: 400 })
    }

    const authService = AuthService.getInstance()
    await authService.resetPassword(token, newPassword)

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to reset password",
      },
      { status: 500 },
    )
  }
}
