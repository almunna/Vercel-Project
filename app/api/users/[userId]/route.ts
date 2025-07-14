import { type NextRequest, NextResponse } from "next/server"
import { getAuthToken } from "../../auth/token/route"

const BASIQ_BASE_URL = process.env.BASIQ_BASE_URL || "https://au-api.basiq.io"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const token = await getAuthToken()
    const { userId } = params

    const response = await fetch(`${BASIQ_BASE_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "basiq-version": "3.0",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Get user failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error getting user:", error)
    return NextResponse.json(
      {
        error: "Failed to get user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
