import { type NextRequest, NextResponse } from "next/server"
import { getAuthToken } from "../auth/token/route"

const BASIQ_BASE_URL = process.env.BASIQ_BASE_URL || "https://au-api.basiq.io"

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()
    const token = await getAuthToken()

    const response = await fetch(`${BASIQ_BASE_URL}/users`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "basiq-version": "3.0",
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`User creation failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("User created:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      {
        error: "Failed to create user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
