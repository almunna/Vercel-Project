export interface KeywordMapping {
  id: string
  keyword: string
  status: "deductible" | "non-deductible"
  atoCategory: string | null
  confidenceLevel: number
  source: "manual" | "ai" | "system"
  description?: string
  examples?: string[]
  usageCount?: number
  createdAt?: Date
  updatedAt?: Date
}

export interface KeywordMappingCreate {
  keyword: string
  status: "deductible" | "non-deductible"
  atoCategory: string | null
  confidenceLevel: number
  source?: "manual" | "ai" | "system"
  description?: string
  examples?: string[]
}

export interface KeywordMappingUpdate {
  status?: "deductible" | "non-deductible"
  atoCategory?: string | null
  confidenceLevel?: number
  description?: string
  examples?: string[]
}

export interface KeywordSearchResult {
  mapping: KeywordMapping
  matchType: "exact" | "contains" | "fuzzy"
  matchScore: number
}

class KeywordMappingService {
  // Add a new method for extracting meaningful keywords from transaction descriptions
  static extractKeywordFromDescription(description: string): string | null {
    // Clean and normalize the description
    const cleaned = description
      .toLowerCase()
      .replace(/\d{4,}/g, "") // Remove long numbers (card numbers, reference numbers)
      .replace(/\d{1,2}\/\d{1,2}\/\d{2,4}/g, "") // Remove dates
      .replace(/\$[\d,]+\.?\d*/g, "") // Remove amounts
      .replace(/[^\w\s]/g, " ") // Remove special characters
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim()

    // Split into words and filter meaningful ones
    const words = cleaned.split(" ").filter((word) => word.length >= 3)

    // Common words to skip
    const commonWords = new Set([
      "the",
      "and",
      "for",
      "are",
      "but",
      "not",
      "you",
      "all",
      "can",
      "had",
      "her",
      "was",
      "one",
      "our",
      "out",
      "day",
      "get",
      "has",
      "him",
      "his",
      "how",
      "its",
      "may",
      "new",
      "now",
      "old",
      "see",
      "two",
      "who",
      "boy",
      "did",
      "she",
      "use",
      "way",
      "will",
      "with",
      "from",
      "they",
      "know",
      "want",
      "been",
      "good",
      "much",
      "some",
      "time",
      "very",
      "when",
      "come",
      "here",
      "just",
      "like",
      "long",
      "make",
      "many",
      "over",
      "such",
      "take",
      "than",
      "them",
      "well",
      "were",
      "purchase",
      "payment",
      "transaction",
      "card",
      "debit",
      "credit",
      "online",
      "store",
      "shop",
    ])

    // Find meaningful words (not common words)
    const meaningfulWords = words.filter((word) => !commonWords.has(word))

    // Prioritize longer, more specific words
    meaningfulWords.sort((a, b) => b.length - a.length)

    // Return the most meaningful word
    return meaningfulWords.length > 0 ? meaningfulWords[0] : words.length > 0 ? words[0] : null
  }

  async createMapping(data: KeywordMappingCreate): Promise<KeywordMapping> {
    const response = await fetch("/api/keyword-mappings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mappings: [data] }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create keyword mapping: ${response.status}`)
    }

    const result = await response.json()
    return result.mapping
  }

  async bulkCreateMappings(mappings: KeywordMappingCreate[]): Promise<{ created: number; skipped: number }> {
    if (!mappings || mappings.length === 0) {
      return { created: 0, skipped: 0 }
    }

    try {
      const response = await fetch("/api/keyword-mappings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mappings }),
      })

      if (!response.ok) {
        throw new Error(`Failed to create keyword mappings: ${response.status}`)
      }

      const result = await response.json()
      return {
        created: result.created || 0,
        skipped: result.skipped || 0,
      }
    } catch (error) {
      console.error("Error creating keyword mappings:", error)
      throw error
    }
  }

  async updateMapping(id: string, data: KeywordMappingUpdate): Promise<KeywordMapping | null> {
    const response = await fetch(`/api/keyword-mappings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`Failed to update keyword mapping: ${response.status}`)
    }

    const result = await response.json()
    return result.mapping
  }

  async deleteMapping(id: string): Promise<boolean> {
    const response = await fetch(`/api/keyword-mappings/${id}`, {
      method: "DELETE",
    })

    return response.ok
  }

  async getMappingById(id: string): Promise<KeywordMapping | null> {
    const response = await fetch(`/api/keyword-mappings/${id}`)

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`Failed to get keyword mapping: ${response.status}`)
    }

    const result = await response.json()
    return result.mapping
  }

  async getAllMappings(
    page = 1,
    limit = 50,
    sortBy = "keyword",
    sortOrder = "asc",
  ): Promise<{ mappings: KeywordMapping[]; total: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
    })

    const response = await fetch(`/api/keyword-mappings?${params}`)

    if (!response.ok) {
      throw new Error(`Failed to get keyword mappings: ${response.status}`)
    }

    const result = await response.json()
    return {
      mappings: result.mappings || [],
      total: result.total || 0,
    }
  }

  async findExactMatch(keyword: string): Promise<KeywordMapping | null> {
    const response = await fetch("/api/keyword-mappings/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: keyword, exact: true }),
    })

    if (!response.ok) {
      return null
    }

    const result = await response.json()
    return result.success && result.mapping ? result.mapping : null
  }

  // BULK SEARCH - This is the key optimization!
  async bulkSearchMappings(descriptions: string[]): Promise<Map<string, KeywordSearchResult>> {
    const results = new Map<string, KeywordSearchResult>()

    if (descriptions.length === 0) return results

    console.log(`🔍 BULK searching ${descriptions.length} descriptions via API`)

    try {
      const response = await fetch("/api/keyword-mappings/bulk-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descriptions }),
      })

      if (!response.ok) {
        console.error(`Bulk search API failed: ${response.status}`)
        return results
      }

      const data = await response.json()

      if (data.success && data.results) {
        Object.entries(data.results).forEach(([description, result]: [string, any]) => {
          if (result && result.mapping) {
            results.set(description, {
              mapping: result.mapping,
              matchType: result.matchType || "exact",
              matchScore: result.matchScore || 100,
            })
          }
        })
      }

      console.log(`✅ BULK search complete: ${results.size}/${descriptions.length} descriptions matched`)
    } catch (error) {
      console.error("Bulk search failed:", error)
    }

    return results
  }

  // Single search method that uses bulk search internally for consistency
  async searchMappings(description: string, threshold = 60): Promise<KeywordSearchResult | null> {
    const bulkResults = await this.bulkSearchMappings([description])
    const result = bulkResults.get(description)

    if (result && result.matchScore >= threshold) {
      // Increment usage count asynchronously
      this.incrementUsageCount(result.mapping.id).catch((error) => {
        console.error("Failed to increment usage count:", error)
      })
      return result
    }

    return null
  }

  async incrementUsageCount(id: string): Promise<void> {
    try {
      await fetch(`/api/keyword-mappings/${id}/usage`, {
        method: "POST",
      })
    } catch (error) {
      console.error("Failed to increment usage count:", error)
    }
  }

  async getStatistics(): Promise<{
    total: number
    deductible: number
    nonDeductible: number
    averageConfidence: number
    mostUsed: Array<{ id: string; keyword: string; status: string; usageCount: number }>
  }> {
    try {
      const response = await fetch("/api/keyword-mappings/stats")

      if (!response.ok) {
        throw new Error(`Failed to get statistics: ${response.status}`)
      }

      const result = await response.json()
      return (
        result.stats || {
          total: 0,
          deductible: 0,
          nonDeductible: 0,
          averageConfidence: 0,
          mostUsed: [],
        }
      )
    } catch (error) {
      console.error("Error getting keyword mapping stats:", error)
      return {
        total: 0,
        deductible: 0,
        nonDeductible: 0,
        averageConfidence: 0,
        mostUsed: [],
      }
    }
  }

  // Add method to get comprehensive keyword mappings statistics
  async getComprehensiveStatistics(): Promise<{
    totalMappings: number
    deductibleMappings: number
    nonDeductibleMappings: number
    averageConfidence: number
    categoryBreakdown: Array<{ category: string; count: number }>
    sourceBreakdown: Array<{ source: string; count: number }>
    mostUsedKeywords: Array<{ keyword: string; usageCount: number; status: string }>
  }> {
    try {
      const response = await fetch("/api/keyword-mappings/comprehensive-stats")

      if (!response.ok) {
        throw new Error(`Failed to get comprehensive statistics: ${response.status}`)
      }

      const result = await response.json()
      return (
        result.stats || {
          totalMappings: 0,
          deductibleMappings: 0,
          nonDeductibleMappings: 0,
          averageConfidence: 0,
          categoryBreakdown: [],
          sourceBreakdown: [],
          mostUsedKeywords: [],
        }
      )
    } catch (error) {
      console.error("Error getting comprehensive keyword mapping stats:", error)
      return {
        totalMappings: 0,
        deductibleMappings: 0,
        nonDeductibleMappings: 0,
        averageConfidence: 0,
        categoryBreakdown: [],
        sourceBreakdown: [],
        mostUsedKeywords: [],
      }
    }
  }
}

export const keywordMappingService = new KeywordMappingService()
