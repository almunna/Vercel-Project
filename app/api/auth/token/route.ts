import { NextResponse } from "next/server"

const BASIQ_BASE_URL = process.env.BASIQ_BASE_URL || "https://au-api.basiq.io"
const BASIQ_TOKEN =
  process.env.BASIQ_TOKEN ||
  "OTExZjU2OTctYTI5NS00NTYzLTg4NzAtMGZhMmQ1MGMzZGYyOjMwYzhlYTViLTU0MDgtNDVlNS1hNThlLWJmYWI3Mzg1Y2VjOQ=="

let cachedToken: string | null = null
let tokenExpiry = 0

export async function getAuthToken(): Promise<string> {
  // Check if we have a valid cached token (cache for 50 minutes, tokens expire in 60)
  if (cachedToken && Date.now() < tokenExpiry) {
    console.log("Using cached auth token")
    return cachedToken
  }

  console.log("Getting new auth token...")
  console.log("Using BASIQ_TOKEN (first 20 chars):", BASIQ_TOKEN.substring(0, 20))

  try {
    // Use the exact format from Basiq documentation
    const response = await fetch(`${BASIQ_BASE_URL}/token`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/x-www-form-urlencoded",
        "basiq-version": "3.0",
        Authorization: `Basic ${BASIQ_TOKEN}`,
      },
      body: "scope=SERVER_ACCESS",
    })

    console.log("Token response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Token response error:", errorText)
      throw new Error(`Failed to get server access token: ${response.status} - ${errorText}`)
    }

    const tokenData = await response.json()
    cachedToken = tokenData.access_token
    // Cache for 50 minutes to be safe (tokens expire in 60 minutes)
    tokenExpiry = Date.now() + 50 * 60 * 1000

    console.log("Server access token obtained successfully")
    console.log("Token preview:", cachedToken?.substring(0, 20) + "...")
    return cachedToken
  } catch (error) {
    console.error("Error getting server access token:", error)
    throw error
  }
}

export async function POST() {
  try {
    const token = await getAuthToken()
    return NextResponse.json({ access_token: token })
  } catch (error) {
    console.error("Token endpoint error:", error)
    return NextResponse.json(
      {
        error: "Failed to get auth token",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
