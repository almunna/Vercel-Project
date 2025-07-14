import { type NextRequest, NextResponse } from "next/server"
import { getAuthToken } from "../../../auth/token/route"

const BASIQ_BASE_URL = process.env.BASIQ_BASE_URL || "https://au-api.basiq.io"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const token = await getAuthToken()
    const { userId } = params

    const response = await fetch(`${BASIQ_BASE_URL}/users/${userId}/consents`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "basiq-version": "3.0",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Get consents failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error getting consents:", error)
    return NextResponse.json(
      {
        error: "Failed to get consents",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
