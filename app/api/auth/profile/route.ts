import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/middleware/auth"
import { authService } from "@/lib/services/auth"

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const user = await authService.getUserById(authResult.userId!)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Return user profile data
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        preferences: user.preferences || {},
        profile: user.profile || {},
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    })
  } catch (error) {
    console.error("Profile GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    console.log("Profile PATCH request received")

    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      console.error("Authentication failed:", authResult.error)
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    console.log("User authenticated:", authResult.userId)

    const body = await request.json()
    console.log("Profile update request body:", body)

    const updatedUser = await authService.updateUserProfile(authResult.userId!, body)
    if (!updatedUser) {
      console.error("Failed to update user profile")
      return NextResponse.json({ error: "Failed to update profile" }, { status: 400 })
    }

    console.log("Profile updated successfully")

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        preferences: updatedUser.preferences || {},
        profile: updatedUser.profile || {},
        updatedAt: updatedUser.updatedAt,
      },
    })
  } catch (error) {
    console.error("Profile PATCH error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
