import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/services/auth"

export async function POST(request: NextRequest) {
  try {
    // Get user from auth token
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const authService = AuthService.getInstance()
    const decoded = authService.verifyJWT(token)
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Current password and new password are required" },
        { status: 400 },
      )
    }

    // Change password
    await authService.changePassword(decoded.userId, currentPassword, newPassword)

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to change password",
      },
      { status: 500 },
    )
  }
}
