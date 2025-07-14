import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/services/auth"
import { DatabaseService } from "@/lib/services/database"

export async function GET(request: NextRequest) {
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

    // Get dashboard data
    const dbService = DatabaseService.getInstance()

    const [stats, monthlyTrends, topCategories] = await Promise.all([
      dbService.getUserStats(decoded.userId),
      dbService.getMonthlyTrends(decoded.userId, 12),
      dbService.getCategoryBreakdown(decoded.userId),
    ])

    return NextResponse.json({
      success: true,
      data: {
        stats,
        monthlyTrends,
        topCategories,
      },
    })
  } catch (error) {
    console.error("Dashboard data error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get dashboard data",
      },
      { status: 500 },
    )
  }
}
