import { keywordMappingService } from "./keyword-mapping-service"
import type { KeywordMappingCreate } from "../models/keyword-mapping"

export interface EnhancedClassificationResult {
  isDeductible: boolean
  deductionType?: string
  confidence: number
  reasoning: string
  classification: string
  source: "database" | "ai" | "fallback"
  keywordUsed?: string
}

export class EnhancedAIClassificationService {
  // Main classification method that checks database first, then AI
  static async classifyTransaction(
    description: string,
    amount: number,
    enabledDeductions: string[] = [],
  ): Promise<EnhancedClassificationResult> {
    console.log("🔍 Enhanced classification for:", description.substring(0, 50))

    // Only classify expenses (negative amounts) as potential deductions
    if (amount >= 0) {
      return {
        isDeductible: false,
        confidence: 100,
        reasoning: "Income transactions are not deductible",
        classification: "non-deductible",
        source: "fallback",
      }
    }

    // Step 1: Extract keyword from description for database lookup
    const extractedKeyword = this.extractKeywordFromDescription(description)

    if (!extractedKeyword || extractedKeyword.length < 3) {
      console.log("⚠️ Could not extract meaningful keyword from description")
    } else {
      console.log("🔑 Extracted keyword for lookup:", extractedKeyword)
    }

    // Step 2: Check database for existing keyword mappings (multiple strategies)
    try {
      let dbResult = null

      // Strategy 1: Direct keyword match if we extracted one
      if (extractedKeyword) {
        dbResult = await keywordMappingService.findExactMatch(extractedKeyword)
        if (dbResult) {
          console.log("✅ Found exact keyword match:", extractedKeyword)
        }
      }

      // Strategy 2: Fuzzy search on full description if no exact match
      if (!dbResult) {
        dbResult = await keywordMappingService.searchMappings(description)
        if (dbResult && dbResult.matchScore >= 70) {
          console.log("✅ Found fuzzy description match:", {
            keyword: dbResult.mapping.keyword,
            matchScore: dbResult.matchScore,
            matchType: dbResult.matchType,
          })
        } else {
          dbResult = null // Reset if match score too low
        }
      }

      // If we found a database match, use it
      if (dbResult) {
        const mapping = dbResult.mapping
        const isDeductible = mapping.status === "deductible"

        // Increment usage count asynchronously
        keywordMappingService.incrementUsageCount(mapping.id).catch(console.error)

        return {
          isDeductible,
          deductionType: isDeductible ? mapping.atoCategory || undefined : undefined,
          confidence: Math.min(mapping.confidenceLevel, dbResult.matchScore || 100),
          reasoning: `Database match: ${mapping.keyword} (${dbResult.matchType || "exact"})`,
          classification: isDeductible ? "possible deduction" : "non-deductible",
          source: "database",
          keywordUsed: mapping.keyword,
        }
      }
    } catch (error) {
      console.warn("Database lookup failed, proceeding to AI:", error)
    }

    // Step 3: Use AI classification if no database match found
    console.log("🤖 No database match found, using AI classification")

    try {
      const aiResult = await this.callOpenAIClassification(description, amount, enabledDeductions)

      // Step 4: Save AI result to database for future use
      if (aiResult.confidence >= 60) {
        const keywordToSave = extractedKeyword || this.extractKeywordFromDescription(description)
        if (keywordToSave && keywordToSave.length >= 3) {
          await this.saveAIResultToDatabase(keywordToSave, description, aiResult)
        }
      }

      return {
        ...aiResult,
        source: "ai",
      }
    } catch (error) {
      console.error("AI classification failed:", error)

      // Fallback to non-deductible
      return {
        isDeductible: false,
        confidence: 0,
        reasoning: "AI classification failed",
        classification: "non-deductible",
        source: "fallback",
      }
    }
  }

  // Batch classification with database-first approach
  static async batchClassifyTransactions(
    transactions: Array<{ id: string; description: string; amount: number }>,
    enabledDeductions: string[] = [],
    onProgress?: (completed: number, total: number, dbHits: number, aiCalls: number) => void,
  ): Promise<Array<{ id: string; result: EnhancedClassificationResult }>> {
    console.log("🚀 Enhanced batch classification for", transactions.length, "transactions")

    const results: Array<{ id: string; result: EnhancedClassificationResult }> = []
    let dbHits = 0
    let aiCalls = 0

    // Process transactions in smaller batches to avoid overwhelming the system
    const batchSize = 10

    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize)

      // Process batch in parallel
      const batchPromises = batch.map(async (transaction) => {
        const result = await this.classifyTransaction(transaction.description, transaction.amount, enabledDeductions)

        if (result.source === "database") dbHits++
        if (result.source === "ai") aiCalls++

        return { id: transaction.id, result }
      })

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)

      // Report progress
      if (onProgress) {
        onProgress(results.length, transactions.length, dbHits, aiCalls)
      }

      // Small delay between batches
      if (i + batchSize < transactions.length) {
        await new Promise((resolve) => setTimeout(resolve, 200))
      }
    }

    console.log("✅ Enhanced batch classification complete:", {
      total: results.length,
      dbHits,
      aiCalls,
      dbHitRate: `${((dbHits / results.length) * 100).toFixed(1)}%`,
      deductible: results.filter((r) => r.result.isDeductible).length,
    })

    return results
  }

  // Call OpenAI for classification
  private static async callOpenAIClassification(
    description: string,
    amount: number,
    enabledDeductions: string[],
  ): Promise<EnhancedClassificationResult> {
    const response = await fetch("/api/ai/classify-transaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description,
        amount,
        enabledDeductions,
      }),
    })

    if (!response.ok) {
      throw new Error(`AI API failed: ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || "AI classification failed")
    }

    const isDeductible = result.classification === "AI possible deduction"

    return {
      isDeductible,
      deductionType: isDeductible ? result.category : undefined,
      confidence: result.confidence || 0,
      reasoning: result.reasoning || "AI classification",
      classification: isDeductible ? "possible deduction" : "non-deductible",
      source: "ai" as const,
    }
  }

  // Enhanced keyword extraction method
  private static extractKeywordFromDescription(description: string): string | null {
    // Clean and normalize the description
    const cleaned = description
      .toLowerCase()
      .replace(/\d{4,}/g, "") // Remove long numbers
      .replace(/\d{1,2}\/\d{1,2}\/\d{2,4}/g, "") // Remove dates
      .replace(/\$[\d,]+\.?\d*/g, "") // Remove amounts
      .replace(/[^\w\s]/g, " ") // Remove special characters
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim()

    // Split into words and find the most meaningful one
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
      "pty",
      "ltd",
      "australia",
      "sydney",
      "melbourne",
      "brisbane",
      "perth",
      "adelaide",
    ])

    // Find meaningful words (not common words)
    const meaningfulWords = words.filter((word) => !commonWords.has(word))

    // Prioritize business/brand names and longer words
    meaningfulWords.sort((a, b) => {
      // Prioritize words that look like business names (capitalized in original)
      const aIsBusinessName =
        description.toLowerCase() !== description && description.includes(a.charAt(0).toUpperCase() + a.slice(1))
      const bIsBusinessName =
        description.toLowerCase() !== description && description.includes(b.charAt(0).toUpperCase() + b.slice(1))

      if (aIsBusinessName && !bIsBusinessName) return -1
      if (!aIsBusinessName && bIsBusinessName) return 1

      // Then by length (longer = more specific)
      return b.length - a.length
    })

    return meaningfulWords.length > 0 ? meaningfulWords[0] : words.length > 0 ? words[0] : null
  }

  // Enhanced method to save AI result to database
  private static async saveAIResultToDatabase(
    keyword: string,
    originalDescription: string,
    aiResult: EnhancedClassificationResult,
  ): Promise<void> {
    try {
      if (!keyword || keyword.length < 3) {
        console.log("⚠️ Skipping database save - keyword too short:", keyword)
        return
      }

      // Check if this keyword already exists
      const existingMapping = await keywordMappingService.findExactMatch(keyword)
      if (existingMapping) {
        console.log("⚠️ Keyword mapping already exists:", keyword)
        return
      }

      const mappingData: KeywordMappingCreate = {
        keyword: keyword.toLowerCase(),
        status: aiResult.isDeductible ? "deductible" : "non-deductible",
        atoCategory: aiResult.deductionType || null,
        confidenceLevel: Math.max(aiResult.confidence, 60), // Minimum confidence for AI results
        source: "ai",
        description: `Auto-generated from AI: ${aiResult.reasoning}`,
        examples: [originalDescription.substring(0, 100)], // Store truncated example
      }

      await keywordMappingService.createMapping(mappingData)

      console.log("💾 Saved AI result to database:", {
        keyword,
        status: mappingData.status,
        confidence: mappingData.confidenceLevel,
        atoCategory: mappingData.atoCategory,
      })
    } catch (error) {
      console.warn("Failed to save AI result to database:", error)
    }
  }

  // Get classification statistics
  static async getClassificationStats(): Promise<{
    totalClassifications: number
    databaseHits: number
    aiCalls: number
    accuracy: number
    topKeywords: Array<{ keyword: string; usageCount: number }>
  }> {
    try {
      const stats = await keywordMappingService.getStatistics()

      return {
        totalClassifications: stats.totalMappings,
        databaseHits: stats.mostUsedMappings.reduce((sum, mapping) => sum + mapping.usageCount, 0),
        aiCalls: stats.totalMappings, // Approximate - each mapping was initially an AI call
        accuracy: stats.averageConfidence,
        topKeywords: stats.mostUsedMappings.map((mapping) => ({
          keyword: mapping.keyword,
          usageCount: mapping.usageCount,
        })),
      }
    } catch (error) {
      console.error("Error getting classification stats:", error)
      return {
        totalClassifications: 0,
        databaseHits: 0,
        aiCalls: 0,
        accuracy: 0,
        topKeywords: [],
      }
    }
  }
}
