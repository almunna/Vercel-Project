import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/middleware/auth"
import { AuthService } from "@/lib/services/auth"

export async function GET(request: NextRequest) {
  try {
    const { user } = await authenticateRequest(request)

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch user",
      },
      { status: 401 },
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await authenticateRequest(request)
    const body = await request.json()

    const authService = AuthService.getInstance()
    const updatedUser = await authService.updateUserProfile(userId, body)

    return NextResponse.json({
      success: true,
      user: updatedUser,
    })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update user",
      },
      { status: 500 },
    )
  }
}
