import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/middleware/auth"

export async function GET(request: NextRequest) {
  try {
    console.log("=== Auth Check API ===")

    const { userId, user } = await authenticateRequest(request)

    return NextResponse.json({
      success: true,
      authenticated: true,
      userId,
      userEmail: user.email,
      message: "Authentication successful",
    })
  } catch (error) {
    console.error("Auth check failed:", error)
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        error: error instanceof Error ? error.message : "Authentication failed",
      },
      { status: 401 },
    )
  }
}
