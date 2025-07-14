import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key"

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Starting subscription update process...")

    // Get token from multiple possible sources (matching your auth pattern)
    let token = request.headers.get("authorization")?.replace("Bearer ", "")
    console.log("🔑 Token from Authorization header:", token ? "Found" : "Not found")

    if (!token) {
      // Try different cookie names that might be used
      token =
        request.cookies.get("auth-token")?.value ||
        request.cookies.get("token")?.value ||
        request.cookies.get("authToken")?.value
      console.log("🍪 Token from cookies:", token ? "Found" : "Not found")

      // Debug: Log all cookies to see what's available
      const allCookies = request.cookies.getAll()
      console.log(
        "🍪 All available cookies:",
        allCookies.map((c) => `${c.name}=${c.value.substring(0, 20)}...`),
      )
    }

    if (!token) {
      console.log("❌ No token found in any location")
      return NextResponse.json(
        {
          success: false,
          error: "No authentication token found. Please log in again.",
        },
        { status: 401 },
      )
    }

    console.log("✅ Token found, length:", token.length)

    // Verify JWT token
    let decoded: { userId: string; id?: string }
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string; id?: string }
      console.log("✅ Token decoded successfully")
    } catch (jwtError) {
      console.error("❌ JWT verification failed:", jwtError)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid authentication token. Please log in again.",
        },
        { status: 401 },
      )
    }

    // Get userId from decoded token (handle different possible field names)
    const userId = decoded.userId || decoded.id
    if (!userId) {
      console.error("❌ No userId found in token payload")
      return NextResponse.json(
        {
          success: false,
          error: "Invalid token payload",
        },
        { status: 401 },
      )
    }

    console.log("👤 User ID from token:", userId)

    // Get request body
    const body = await request.json()
    console.log("📦 Request body:", body)

    const { plan, planType, status, upgradeDate } = body

    // Connect to database
    console.log("🔌 Connecting to database...")
    const { db } = await connectToDatabase()

    // Find user - handle both string and ObjectId formats
    let user
    try {
      if (ObjectId.isValid(userId)) {
        user = await db.collection("users").findOne({ _id: new ObjectId(userId) })
      } else {
        user = await db.collection("users").findOne({ _id: userId })
      }
    } catch (dbError) {
      console.error("❌ Database query error:", dbError)
      return NextResponse.json(
        {
          success: false,
          error: "Database error",
        },
        { status: 500 },
      )
    }

    if (!user) {
      console.log("❌ User not found with ID:", userId)
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
      )
    }

    console.log("✅ User found:", user.email)
    console.log("📋 Current user subscription:", user.subscription)

    // Update subscription to premium
    const updatedSubscription = {
      plan: "premium", // Force to premium
      status: status || "active",
      planType: planType || "ai",
      upgradeDate: upgradeDate || new Date().toISOString(),
      paymentMethod: "stripe",
      startDate: user.subscription?.startDate || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    console.log("💎 Updating subscription to:", updatedSubscription)

    // Update user in database
    let updateResult
    try {
      if (ObjectId.isValid(userId)) {
        updateResult = await db.collection("users").updateOne(
          { _id: new ObjectId(userId) },
          {
            $set: {
              subscription: updatedSubscription,
              updatedAt: new Date().toISOString(),
            },
          },
        )
      } else {
        updateResult = await db.collection("users").updateOne(
          { _id: userId },
          {
            $set: {
              subscription: updatedSubscription,
              updatedAt: new Date().toISOString(),
            },
          },
        )
      }
    } catch (updateError) {
      console.error("❌ Database update error:", updateError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update subscription in database",
        },
        { status: 500 },
      )
    }

    console.log("📊 Update result:", updateResult)

    if (updateResult.modifiedCount === 0) {
      console.log("⚠️ No documents were modified")
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update subscription - no changes made",
        },
        { status: 500 },
      )
    }

    // Fetch updated user to confirm
    let updatedUser
    try {
      if (ObjectId.isValid(userId)) {
        updatedUser = await db.collection("users").findOne({ _id: new ObjectId(userId) })
      } else {
        updatedUser = await db.collection("users").findOne({ _id: userId })
      }
    } catch (fetchError) {
      console.error("❌ Error fetching updated user:", fetchError)
    }

    console.log("✅ Updated user subscription:", updatedUser?.subscription)
    console.log("🎉 Subscription update completed successfully!")

    return NextResponse.json({
      success: true,
      message: "Subscription updated successfully to Premium!",
      subscription: updatedSubscription,
    })
  } catch (error) {
    console.error("💥 Error updating subscription:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error while updating subscription",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("📖 Getting subscription info...")

    // Get token from multiple sources
    let token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      token =
        request.cookies.get("auth-token")?.value ||
        request.cookies.get("token")?.value ||
        request.cookies.get("authToken")?.value
    }

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "No authentication token",
        },
        { status: 401 },
      )
    }

    let userId: string
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      userId = decoded.userId || decoded.id
    } catch (jwtError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid token",
        },
        { status: 401 },
      )
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Find user
    let user
    if (ObjectId.isValid(userId)) {
      user = await db.collection("users").findOne({ _id: new ObjectId(userId) })
    } else {
      user = await db.collection("users").findOne({ _id: userId })
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      subscription: user.subscription || { plan: "free", status: "active" },
    })
  } catch (error) {
    console.error("💥 Error getting subscription:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
