export interface MerchantSearchResult {
  merchant: any
  matchType: "exact" | "alias" | "keyword" | "fuzzy"
  matchScore: number
  matchedTerm: string
}

class MerchantService {
  // STEP 1: Search for merchants in database without AI
  async searchMerchantInTransaction(description: string): Promise<MerchantSearchResult | null> {
    console.log(`🔍 Searching merchant in: "${description}"`)

    try {
      const response = await fetch("/api/merchants/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      })

      if (!response.ok) {
        console.error(`Merchant search failed: ${response.status}`)
        return null
      }

      const data = await response.json()

      if (data.success && data.merchant) {
        console.log(`✅ Found merchant: ${data.merchant.displayName} (${data.merchant.anzsicDescription})`)
        return {
          merchant: data.merchant,
          matchType: data.matchType || "exact",
          matchScore: data.matchScore || 100,
          matchedTerm: data.matchedTerm || "",
        }
      }

      console.log(`❌ No merchant found in database for: "${description}"`)
      return null
    } catch (error) {
      console.error("Error searching merchant:", error)
      return null
    }
  }

  // Bulk search for multiple transactions
  async bulkSearchMerchants(descriptions: string[]): Promise<Map<string, MerchantSearchResult>> {
    const results = new Map<string, MerchantSearchResult>()

    if (descriptions.length === 0) return results

    console.log(`🔍 BULK merchant search for ${descriptions.length} descriptions`)

    try {
      const response = await fetch("/api/merchants/bulk-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descriptions }),
      })

      if (!response.ok) {
        console.error(`Bulk merchant search failed: ${response.status}`)
        return results
      }

      const data = await response.json()

      if (data.success && data.results) {
        Object.entries(data.results).forEach(([description, result]: [string, any]) => {
          if (result && result.merchant) {
            results.set(description, {
              merchant: result.merchant,
              matchType: result.matchType || "exact",
              matchScore: result.matchScore || 100,
              matchedTerm: result.matchedTerm || "",
            })
          }
        })
      }

      console.log(`✅ BULK merchant search complete: ${results.size}/${descriptions.length} found`)
    } catch (error) {
      console.error("Bulk merchant search failed:", error)
    }

    return results
  }

  // Create new merchant
  async createMerchant(merchantData: any): Promise<any> {
    const response = await fetch("/api/merchants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(merchantData),
    })

    if (!response.ok) {
      throw new Error(`Failed to create merchant: ${response.status}`)
    }

    const result = await response.json()
    return result.merchant
  }

  // Get merchant by ID
  async getMerchantById(id: string): Promise<any | null> {
    const response = await fetch(`/api/merchants/${id}`)

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`Failed to get merchant: ${response.status}`)
    }

    const result = await response.json()
    return result.merchant
  }

  // Update merchant
  async updateMerchant(id: string, updateData: any): Promise<any | null> {
    const response = await fetch(`/api/merchants/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`Failed to update merchant: ${response.status}`)
    }

    const result = await response.json()
    return result.merchant
  }

  // Get all merchants
  async getAllMerchants(page = 1, limit = 50): Promise<{ merchants: any[]; total: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    const response = await fetch(`/api/merchants?${params}`)

    if (!response.ok) {
      throw new Error(`Failed to get merchants: ${response.status}`)
    }

    const result = await response.json()
    return {
      merchants: result.merchants || [],
      total: result.total || 0,
    }
  }

  // Get merchant statistics
  async getStatistics(): Promise<{
    total: number
    active: number
    bySource: Array<{ source: string; count: number }>
    topAnzsicCodes: Array<{ code: string; description: string; count: number }>
  }> {
    try {
      const response = await fetch("/api/merchants/stats")

      if (!response.ok) {
        throw new Error(`Failed to get merchant statistics: ${response.status}`)
      }

      const result = await response.json()
      return (
        result.stats || {
          total: 0,
          active: 0,
          bySource: [],
          topAnzsicCodes: [],
        }
      )
    } catch (error) {
      console.error("Error getting merchant stats:", error)
      return {
        total: 0,
        active: 0,
        bySource: [],
        topAnzsicCodes: [],
      }
    }
  }
}

export const merchantService = new MerchantService()
