import { type NextRequest, NextResponse } from "next/server"
import { getAuthToken } from "../../../auth/token/route"

const BASIQ_BASE_URL = process.env.BASIQ_BASE_URL || "https://au-api.basiq.io"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params

    console.log("Fetching accounts for user:", userId)

    // Get auth token
    const token = await getAuthToken()
    console.log("Using token:", token.substring(0, 20) + "...")

    // Fetch accounts using the exact format from documentation
    const response = await fetch(`${BASIQ_BASE_URL}/users/${userId}/accounts`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
        "basiq-version": "3.0",
      },
    })

    console.log("Accounts response status:", response.status)
    console.log("Accounts response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Get accounts failed:", errorText)
      throw new Error(`Get accounts failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("Accounts data:", JSON.stringify(data, null, 2))

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error getting accounts:", error)
    return NextResponse.json(
      {
        error: "Failed to get accounts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
