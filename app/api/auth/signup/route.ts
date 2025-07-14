import { type NextRequest, NextResponse } from "next/server"
import { authService } from "@/lib/services/auth"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, phone } = body

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        {
          success: false,
          error: "Email, password, first name, and last name are required",
        },
        { status: 400 },
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 8 characters long",
        },
        { status: 400 },
      )
    }

    const result = await authService.signUp({
      email,
      password,
      firstName,
      lastName,
      phone,
    })

    // Set HTTP-only cookie
    const cookieStore = cookies()
    cookieStore.set("auth-token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    console.log("Auth token set in cookie:", result.token.substring(0, 20) + "...")

    return NextResponse.json({
      success: true,
      user: result.user,
      token: result.token,
      message: result.message,
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Registration failed",
      },
      { status: 400 },
    )
  }
}
