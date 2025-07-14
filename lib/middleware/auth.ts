import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "../mongodb"
import { ObjectId } from "mongodb"
import type { User } from "../models/user"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key"

export async function authenticateRequest(
  request: NextRequest,
): Promise<{ success: boolean; userId?: string; user?: User; error?: string }> {
  try {
    console.log("=== Authentication Debug ===")

    // Get token from Authorization header or cookies
    let token = request.headers.get("authorization")?.replace("Bearer ", "")
    console.log("Token from Authorization header:", token ? "Found" : "Not found")

    if (!token) {
      // Try to get from cookies
      token = request.cookies.get("auth-token")?.value
      console.log("Token from cookies:", token ? "Found" : "Not found")

      // Debug: Log all cookies
      const allCookies = request.cookies.getAll()
      console.log(
        "All cookies:",
        allCookies.map((c) => c.name),
      )
    }

    if (!token) {
      console.error("No authentication token provided")
      return { success: false, error: "No authentication token provided" }
    }

    console.log("Token found, length:", token.length)
    console.log("Token preview:", token.substring(0, 20) + "...")

    // Verify JWT token
    let decoded: { userId: string }
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
      console.log("Token decoded successfully, userId:", decoded.userId)
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError)
      return { success: false, error: "Invalid authentication token" }
    }

    if (!decoded.userId) {
      console.error("Invalid token payload - no userId")
      return { success: false, error: "Invalid token payload" }
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(decoded.userId)) {
      console.error("Invalid userId format:", decoded.userId)
      return { success: false, error: "Invalid user ID format" }
    }

    // Get user from database - FIXED: Use connectToDatabase instead of getDatabase
    const { db } = await connectToDatabase()
    const users = db.collection<User>("users")
    const user = await users.findOne({ _id: new ObjectId(decoded.userId) })

    if (!user) {
      console.error("User not found for userId:", decoded.userId)
      return { success: false, error: "User not found" }
    }

    console.log("User found:", user.email)
    console.log("=== Authentication Success ===")

    return { success: true, userId: decoded.userId, user }
  } catch (error) {
    console.error("=== Authentication Failed ===")
    console.error("Authentication error:", error)
    return { success: false, error: "Authentication failed" }
  }
}

export function createAuthToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
}
