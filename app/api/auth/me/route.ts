import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/middleware/auth"

export async function GET(request: NextRequest) {
  try {
    const { userId, user } = await authenticateRequest(request)

    const userResponse = {
      id: user._id!.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      mobile: user.mobile,
      preferences: user.preferences,
      subscription: user.subscription,
      profile: user.profile, // Include profile data which contains salary
      createdAt: user.createdAt,
    }

    return NextResponse.json({
      success: true,
      user: userResponse,
      authenticated: true,
    })
  } catch (error) {
    
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        error: error instanceof Error ? error.message : "Not authenticated",
      },
      { status: 401 },
    )
  }
}
