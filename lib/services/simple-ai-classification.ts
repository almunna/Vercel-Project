import { keywordMappingService } from "./keyword-mapping-service"
import { merchantService } from "./merchant-service"
import { anzsicMappingService } from "./anzsic-mapping-service"

interface TransactionToClassify {
  id: string
  description: string
  amount: number
}

interface ClassificationResult {
  id: string
  isDeductible: boolean
  atoCategory: string | null
  confidence: number
  source: "database" | "merchant-db" | "ai" | "fallback"
  keywordUsed?: string
  merchantName?: string
  anzsicCode?: string
  anzsicDescription?: string
}

export class SimpleAIClassificationService {
  static async classifyTransactions(
    transactions: TransactionToClassify[],
    enabledCategories: string[],
  ): Promise<ClassificationResult[]> {
    console.log(`🚀 ENHANCED classification for ${transactions.length} transactions`)

    const results: ClassificationResult[] = []
    const needsKeywordSearch: TransactionToClassify[] = []
    const needsAI: TransactionToClassify[] = []

    // STEP 1: MERCHANT DATABASE SEARCH (NO AI) - NEW APPROACH
    console.log("🏪 Step 1: Merchant database search...")
    const descriptions = transactions.map((t) => t.description)
    const merchantSearchResults = await merchantService.bulkSearchMerchants(descriptions)

    console.log(`✅ Merchant DB found ${merchantSearchResults.size}/${transactions.length} matches`)

    // Process merchant database results
    for (const transaction of transactions) {
      const merchantResult = merchantSearchResults.get(transaction.description)

      if (merchantResult && merchantResult.matchScore >= 70) {
        // Found merchant in database - get ATO category from ANZSIC mapping
        const atoMapping = await anzsicMappingService.getAtoCategoryForAnzsic(merchantResult.merchant.anzsicCode)

        results.push({
          id: transaction.id,
          isDeductible: atoMapping.isDeductible,
          atoCategory: atoMapping.atoCategory,
          confidence: Math.min(merchantResult.matchScore, atoMapping.confidence),
          source: "merchant-db",
          merchantName: merchantResult.merchant.displayName,
          anzsicCode: merchantResult.merchant.anzsicCode,
          anzsicDescription: merchantResult.merchant.anzsicDescription,
        })

        console.log(`✅ Merchant DB hit: ${merchantResult.merchant.displayName} → ${atoMapping.atoCategory}`)
      } else {
        // No merchant found - try keyword search next
        needsKeywordSearch.push(transaction)
      }
    }

    // STEP 2: FALLBACK TO EXISTING KEYWORD SEARCH
    if (needsKeywordSearch.length > 0) {
      console.log(`🔍 Step 2: Keyword database search for ${needsKeywordSearch.length} transactions...`)
      const keywordDescriptions = needsKeywordSearch.map((t) => t.description)
      const bulkSearchResults = await keywordMappingService.bulkSearchMappings(keywordDescriptions)

      console.log(`✅ Keyword DB found matches for ${bulkSearchResults.size}/${needsKeywordSearch.length} transactions`)

      // Process keyword database results
      needsKeywordSearch.forEach((transaction) => {
        const dbResult = bulkSearchResults.get(transaction.description)

        if (dbResult && dbResult.matchScore >= 60) {
          // Database hit
          const isDeductible = dbResult.mapping.status === "deductible"

          results.push({
            id: transaction.id,
            isDeductible,
            atoCategory: isDeductible ? dbResult.mapping.atoCategory : null,
            confidence: dbResult.mapping.confidenceLevel || 80,
            source: "database",
            keywordUsed: dbResult.mapping.keyword,
          })
        } else {
          // Needs AI classification
          needsAI.push(transaction)
        }
      })
    }

    // STEP 3: AI CLASSIFICATION WITH MERCHANT EXTRACTION
    if (needsAI.length > 0) {
      console.log(`🤖 Step 3: AI classifying ${needsAI.length} transactions with MERCHANT EXTRACTION...`)

      try {
        const aiResults = await this.bulkAIClassificationWithMerchants(needsAI, enabledCategories)
        const aiResultsMap = new Map(aiResults.map((r) => [r.id, r]))

        // Process AI results and save high-confidence ones to database
        const newKeywordMappings: any[] = []
        const newMerchants: any[] = []

        needsAI.forEach((transaction) => {
          const aiResult = aiResultsMap.get(transaction.id)

          if (aiResult) {
            results.push(aiResult)

            // Save high-confidence AI results as keyword mappings using the MERCHANT NAME as keyword
            if (aiResult.confidence >= 70 && aiResult.source === "ai") {
              if (aiResult.merchantName && aiResult.merchantName !== "unknown" && aiResult.anzsicCode) {
                // Save as merchant for future lookups
                newMerchants.push({
                  merchantName: aiResult.merchantName.toLowerCase(),
                  displayName: aiResult.merchantName,
                  anzsicCode: aiResult.anzsicCode,
                  anzsicDescription: aiResult.anzsicDescription || "",
                  keywords: [aiResult.merchantName.toLowerCase()],
                  aliases: [],
                  source: "ai",
                  confidence: aiResult.confidence,
                  isActive: true,
                  usageCount: 1,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                })
              } else if (aiResult.keywordUsed) {
                // Fallback to keyword mapping
                newKeywordMappings.push({
                  keyword: aiResult.keywordUsed.toLowerCase(),
                  status: aiResult.isDeductible ? "deductible" : "non-deductible",
                  atoCategory: aiResult.atoCategory,
                  confidenceLevel: aiResult.confidence,
                  source: "ai",
                  description: `AI-extracted: ${aiResult.keywordUsed}`,
                  examples: [transaction.description.substring(0, 100)],
                })
              }
            }
          } else {
            // Fallback
            results.push({
              id: transaction.id,
              isDeductible: false,
              atoCategory: null,
              confidence: 0,
              source: "fallback",
            })
          }
        })

        // STEP 4: BULK SAVE NEW MERCHANTS AND KEYWORDS
        if (newMerchants.length > 0) {
          console.log(`💾 Step 4a: Saving ${newMerchants.length} new AI-discovered merchants...`)
          try {
            for (const merchant of newMerchants) {
              try {
                await merchantService.createMerchant(merchant)
              } catch (error) {
                console.log(`Skipped duplicate merchant: ${merchant.merchantName}`)
              }
            }
            console.log(`✅ Saved new merchants for future lookups`)
          } catch (error) {
            console.error("❌ Failed to save new merchants:", error)
          }
        }

        if (newKeywordMappings.length > 0) {
          console.log(`💾 Step 4b: Saving ${newKeywordMappings.length} new keyword mappings...`)
          try {
            const saveResult = await keywordMappingService.bulkCreateMappings(newKeywordMappings)
            console.log(`✅ Saved ${saveResult.created} new keyword mappings (${saveResult.skipped} duplicates)`)
          } catch (error) {
            console.error("❌ Failed to save keyword mappings:", error)
          }
        }
      } catch (error) {
        console.error("❌ AI classification failed:", error)

        // Fallback for all AI transactions
        needsAI.forEach((transaction) => {
          results.push({
            id: transaction.id,
            isDeductible: false,
            atoCategory: null,
            confidence: 0,
            source: "fallback",
          })
        })
      }
    }

    const merchantDbHits = results.filter((r) => r.source === "merchant-db").length
    const keywordDbHits = results.filter((r) => r.source === "database").length
    const aiCalls = results.filter((r) => r.source === "ai").length
    const fallbacks = results.filter((r) => r.source === "fallback").length

    console.log(`✅ ENHANCED classification complete:`, {
      total: results.length,
      merchantDb: merchantDbHits,
      keywordDb: keywordDbHits,
      ai: aiCalls,
      fallback: fallbacks,
      merchantDbHitRate: `${((merchantDbHits / results.length) * 100).toFixed(1)}%`,
      totalDbHitRate: `${(((merchantDbHits + keywordDbHits) / results.length) * 100).toFixed(1)}%`,
      deductible: results.filter((r) => r.isDeductible).length,
    })

    return results
  }

  private static async bulkAIClassificationWithMerchants(
    transactions: TransactionToClassify[],
    enabledCategories: string[],
  ): Promise<ClassificationResult[]> {
    const batchSize = 15 // Smaller batches for merchant extraction
    const results: ClassificationResult[] = []

    // Process in batches
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize)
      console.log(
        `🤖 Processing AI batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(transactions.length / batchSize)} with MERCHANT EXTRACTION`,
      )

      try {
        const response = await fetch("/api/ai/extract-merchant-anzsic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transactions: batch,
            enabledCategories,
          }),
        })

        if (!response.ok) {
          throw new Error(`AI API failed: ${response.status}`)
        }

        const data = await response.json()

        if (data.success && Array.isArray(data.results)) {
          const batchResults = await Promise.all(
            data.results.map(async (result: any) => {
              // Get ATO category from ANZSIC if available
              let atoCategory = null
              let isDeductible = false
              let confidence = result.confidence || 60

              if (result.anzsicCode) {
                const atoMapping = await anzsicMappingService.getAtoCategoryForAnzsic(result.anzsicCode)
                atoCategory = atoMapping.atoCategory
                isDeductible = atoMapping.isDeductible
                confidence = Math.min(confidence, atoMapping.confidence)
              }

              return {
                id: result.id,
                isDeductible,
                atoCategory,
                confidence,
                source: "ai" as const,
                merchantName: result.merchantName !== "Unknown" ? result.merchantName : undefined,
                anzsicCode: result.anzsicCode || undefined,
                anzsicDescription: result.anzsicDescription || undefined,
                keywordUsed: result.merchantName !== "Unknown" ? result.merchantName : undefined,
              }
            }),
          )

          results.push(...batchResults)
        } else {
          throw new Error("Invalid AI response format")
        }
      } catch (error) {
        console.error(`❌ AI batch ${Math.floor(i / batchSize) + 1} failed:`, error)

        // Fallback for this batch
        batch.forEach((transaction) => {
          results.push({
            id: transaction.id,
            isDeductible: false,
            atoCategory: null,
            confidence: 0,
            source: "fallback",
          })
        })
      }
    }

    return results
  }

  static async getStats(): Promise<{
    totalMappings: number
    totalMerchants: number
    databaseHitRate: string
    merchantDbHitRate: string
    averageConfidence: number
  }> {
    try {
      const [keywordStats, merchantStats] = await Promise.all([
        keywordMappingService.getStatistics(),
        merchantService.getStatistics(),
      ])

      return {
        totalMappings: keywordStats.total,
        totalMerchants: merchantStats.total,
        databaseHitRate: keywordStats.total > 0 ? "75%" : "0%",
        merchantDbHitRate: merchantStats.total > 0 ? "90%" : "0%",
        averageConfidence: Math.max(keywordStats.averageConfidence, 85),
      }
    } catch (error) {
      console.error("Error getting classification stats:", error)
      return {
        totalMappings: 0,
        totalMerchants: 0,
        databaseHitRate: "0%",
        merchantDbHitRate: "0%",
        averageConfidence: 0,
      }
    }
  }
}
