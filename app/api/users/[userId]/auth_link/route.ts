import { type NextRequest, NextResponse } from "next/server"
import { getAuthToken } from "../../../auth/token/route"

const BASIQ_BASE_URL = process.env.BASIQ_BASE_URL || "https://au-api.basiq.io"

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const token = await getAuthToken()
    const { userId } = params

    console.log("Creating auth link for user:", userId)

    const response = await fetch(`${BASIQ_BASE_URL}/users/${userId}/auth_link`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
        "basiq-version": "3.0",
      },
    })

    console.log("Auth link response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Auth link creation failed:", errorText)
      throw new Error(`Auth link creation failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("Auth link response:", data)

    // Extract auth_id from the public URL
    const authId = data.links.public.replace("https://connect.basiq.io/", "")

    console.log("Auth link created successfully:", data)
    return NextResponse.json({
      ...data,
      auth_id: authId,
    })
  } catch (error) {
    console.error("Error creating auth link:", error)
    return NextResponse.json(
      {
        error: "Failed to create auth link",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
