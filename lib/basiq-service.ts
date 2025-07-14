// Basiq Service to handle API calls based on official documentation
const BASIQ_BASE_URL = "https://au-api.basiq.io"
const BASIQ_TOKEN =
  process.env.BASIQ_TOKEN ||
  "OTExZjU2OTctYTI5NS00NTYzLTg4NzAtMGZhMmQ1MGMzZGYyOjMwYzhlYTViLTU0MDgtNDVlNS1hNThlLWJmYWI3Mzg1Y2VjOQ=="

interface BasiqUser {
  id: string
  email: string
  mobile: string
}

interface AuthLinkResponse {
  id: string
  links: {
    public: string
    self: string
  }
}

class BasiqService {
  private serverAccessToken: string | null = null
  private tokenExpiry: number | null = null

  private async getServerAccessToken(): Promise<string> {
    // Check if we have a valid token (cache for 50 minutes, tokens expire in 60)
    if (this.serverAccessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      console.log("Using cached server access token")
      return this.serverAccessToken
    }

    console.log("Getting new server access token...")
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
      this.serverAccessToken = tokenData.access_token
      // Cache for 50 minutes to be safe (tokens expire in 60 minutes)
      this.tokenExpiry = Date.now() + 50 * 60 * 1000

      console.log("Server access token obtained successfully")
      console.log("Token preview:", this.serverAccessToken?.substring(0, 20) + "...")
      return this.serverAccessToken
    } catch (error) {
      console.error("Error getting server access token:", error)
      throw error
    }
  }

  async createOrGetUser(email: string, mobile: string): Promise<BasiqUser> {
    const token = await this.getServerAccessToken()

    // According to Basiq docs, you can provide email OR mobile, but we'll provide both
    const userPayload = {
      email: email,
      mobile: mobile,
    }

    console.log("Creating/getting user with payload:", userPayload)
    console.log("Using server token (first 20 chars):", token.substring(0, 20) + "...")

    const userResponse = await fetch(`${BASIQ_BASE_URL}/users`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "basiq-version": "3.0",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userPayload),
    })

    console.log("User response status:", userResponse.status)
    console.log("User response headers:", Object.fromEntries(userResponse.headers.entries()))

    const responseText = await userResponse.text()
    console.log("User response body:", responseText)

    if (userResponse.status === 409) {
      // User already exists, get user by email
      console.log("User exists, fetching existing user...")
      const getUserResponse = await fetch(`${BASIQ_BASE_URL}/users?filter=email.eq('${email}')`, {
        headers: {
          accept: "application/json",
          "basiq-version": "3.0",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!getUserResponse.ok) {
        const getUserError = await getUserResponse.text()
        console.error("Get user error:", getUserError)
        throw new Error("Failed to fetch existing user")
      }

      const getUserData = await getUserResponse.json()
      const userData = getUserData.data && getUserData.data.length > 0 ? getUserData.data[0] : null

      if (!userData) {
        throw new Error("User not found after creation conflict")
      }

      console.log("Found existing user:", userData.id)
      return userData
    } else if (userResponse.ok) {
      const userData = JSON.parse(responseText)
      console.log("New user created successfully:", userData.id)
      return userData
    } else {
      console.error("User creation failed:", responseText)
      throw new Error(`Failed to create or get user: ${userResponse.status} - ${responseText}`)
    }
  }

  async createAuthLink(userId: string, mobile: string): Promise<AuthLinkResponse> {
    const token = await this.getServerAccessToken()

    console.log("Creating auth link for user:", userId)

    const authLinkResponse = await fetch(`${BASIQ_BASE_URL}/users/${userId}/auth_link`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "basiq-version": "3.0",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mobile: mobile,
      }),
    })

    console.log("Auth link response status:", authLinkResponse.status)

    if (!authLinkResponse.ok) {
      const errorText = await authLinkResponse.text()
      console.error("Auth link error:", errorText)
      throw new Error(`Failed to create auth link: ${authLinkResponse.status} - ${errorText}`)
    }

    const authLinkData = await authLinkResponse.json()
    console.log("Auth link created successfully:", authLinkData)
    return authLinkData
  }

  async connectBankAccount(email: string, mobile: string): Promise<{ authId: string; userId: string }> {
    try {
      console.log("=== STARTING BANK ACCOUNT CONNECTION ===")
      console.log("Email:", email, "Mobile:", mobile)

      // Step 1: Create or get user
      console.log("Step 1: Creating/getting user...")
      const user = await this.createOrGetUser(email, mobile)

      // Step 2: Create auth link (this will be used with the Basiq Connect component)
      console.log("Step 2: Creating auth link...")
      const authLink = await this.createAuthLink(user.id, mobile)

      // Extract auth_id from the public URL
      const authId = authLink.links.public.replace("https://connect.basiq.io/", "")

      console.log("=== CONNECTION PROCESS COMPLETED ===")
      console.log("Auth ID generated:", authId)

      return {
        authId,
        userId: user.id,
      }
    } catch (error) {
      console.error("Connect bank account error:", error)
      throw error
    }
  }

  async getUserConsents(userId: string): Promise<any[]> {
    const token = await this.getServerAccessToken()

    console.log("Getting consents for user:", userId)
    console.log("Using token (first 20 chars):", token.substring(0, 20) + "...")

    const response = await fetch(`${BASIQ_BASE_URL}/users/${userId}/consents`, {
      headers: {
        accept: "application/json",
        "basiq-version": "3.0",
        Authorization: `Bearer ${token}`,
      },
    })

    console.log("Get consents response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Get consents error:", errorText)
      throw new Error(`Failed to get consents: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return data.data || []
  }

  async getUserAccounts(userId: string): Promise<any[]> {
    const token = await this.getServerAccessToken()

    console.log("Getting accounts for user:", userId)
    console.log("Using token (first 20 chars):", token.substring(0, 20) + "...")

    const response = await fetch(`${BASIQ_BASE_URL}/users/${userId}/accounts`, {
      headers: {
        accept: "application/json",
        "basiq-version": "3.0",
        Authorization: `Bearer ${token}`,
      },
    })

    console.log("Get accounts response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Get accounts error:", errorText)
      throw new Error(`Failed to get accounts: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return data.data || []
  }

  async getUserTransactions(userId: string): Promise<any[]> {
    const token = await this.getServerAccessToken()

    console.log("Getting transactions for user:", userId)
    console.log("Using token (first 20 chars):", token.substring(0, 20) + "...")

    const response = await fetch(`${BASIQ_BASE_URL}/users/${userId}/transactions`, {
      headers: {
        accept: "application/json",
        "basiq-version": "3.0",
        Authorization: `Bearer ${token}`,
      },
    })

    console.log("Get transactions response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Get transactions error:", errorText)
      throw new Error(`Failed to get transactions: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return data.data || []
  }

  async getUserJobs(userId: string): Promise<any[]> {
    const token = await this.getServerAccessToken()

    console.log("Getting jobs for user:", userId)
    console.log("Using token (first 20 chars):", token.substring(0, 20) + "...")

    const response = await fetch(`${BASIQ_BASE_URL}/users/${userId}/jobs`, {
      headers: {
        accept: "application/json",
        "basiq-version": "3.0",
        Authorization: `Bearer ${token}`,
      },
    })

    console.log("Get jobs response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Get jobs error:", errorText)
      throw new Error(`Failed to get jobs: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return data.data || []
  }

  async getAccountTransactions(userId: string, accountId: string): Promise<any[]> {
    const token = await this.getServerAccessToken()

    console.log("Getting account transactions for user:", userId, "account:", accountId)
    console.log("Using token (first 20 chars):", token.substring(0, 20) + "...")

    const response = await fetch(`${BASIQ_BASE_URL}/users/${userId}/accounts/${accountId}/transactions`, {
      headers: {
        accept: "application/json",
        "basiq-version": "3.0",
        Authorization: `Bearer ${token}`,
      },
    })

    console.log("Get account transactions response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Get account transactions error:", errorText)
      throw new Error(`Failed to get account transactions: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return data.data || []
  }
}

// Export singleton instance
export const basiqService = new BasiqService()
