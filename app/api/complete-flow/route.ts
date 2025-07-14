import { type NextRequest, NextResponse } from "next/server"
import { basiqService } from "@/lib/basiq-service"

export async function POST(request: NextRequest) {
  try {
    const { email, mobile, name } = await request.json()

    console.log("=== COMPLETE FLOW REQUEST ===")
    console.log("Email:", email)
    console.log("Mobile:", mobile)
    console.log("Name:", name)

    if (!email || !mobile) {
      return NextResponse.json({ error: "Email and mobile are required" }, { status: 400 })
    }

    // Connect bank account using Basiq service
    const result = await basiqService.connectBankAccount(email, mobile)

    console.log("=== COMPLETE FLOW SUCCESS ===")
    console.log("Result:", result)

    // Return the result with frontend URL for Basiq Connect
    return NextResponse.json({
      success: true,
      user: {
        id: result.userId,
        email,
        mobile,
        name,
      },
      auth_id: result.authId,
      frontend_url: `https://connect.basiq.io/${result.authId}`,
      message: "Bank connection initiated successfully",
    })
  } catch (error) {
    console.error("Complete flow error:", error)

    let errorMessage = "Failed to initiate bank connection"
    let statusCode = 500

    if (error instanceof Error) {
      if (error.message.includes("Rate limit")) {
        errorMessage = "Too many requests. Please wait a moment and try again."
        statusCode = 429
      } else if (error.message.includes("409")) {
        errorMessage = "User already exists. Please try connecting again."
        statusCode = 409
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: statusCode },
    )
  }
}
