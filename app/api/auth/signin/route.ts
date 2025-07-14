import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/services/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    const authService = AuthService.getInstance()

    // Authenticate user
    const { user, token } = await authService.authenticateUser(email, password)

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Signed in successfully",
      user: {
        id: user._id?.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        profile: user.profile,
        subscription: user.subscription,
        settings: user.settings,
        isEmailVerified: user.isEmailVerified,
        basiqUserId: user.basiqUserId,
      },
    })

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Signin error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Authentication failed",
      },
      { status: 401 },
    )
  }
}
