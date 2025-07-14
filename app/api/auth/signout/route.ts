import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    // Clear the auth token cookie
    const cookieStore = cookies()
    cookieStore.delete("auth-token")

    return NextResponse.json({
      success: true,
      message: "Signed out successfully",
    })
  } catch (error) {
    console.error("Signout error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to sign out",
      },
      { status: 500 },
    )
  }
}
