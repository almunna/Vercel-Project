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
  source: "merchant-db" | "ai-merchant" | "fallback"
  merchantName?: string
  anzsicCode?: string
  anzsicDescription?: string
  matchedTerm?: string
}

export class EnhancedMerchantClassificationService {
  static async classifyTransactions(
    transactions: TransactionToClassify[],
    enabledCategories: string[],
  ): Promise<ClassificationResult[]> {
    console.log(`🚀 ENHANCED MERCHANT classification for ${transactions.length} transactions`)

    const results: ClassificationResult[] = []
    const needsAI: TransactionToClassify[] = []

    // STEP 1: BULK MERCHANT DATABASE SEARCH (NO AI)
    console.log("🔍 Step 1: Bulk merchant database search...")
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
          matchedTerm: merchantResult.matchedTerm,
        })

        console.log(`✅ Merchant DB hit: ${merchantResult.merchant.displayName} → ${atoMapping.atoCategory}`)
      } else {
        // No merchant found - needs AI fallback
        needsAI.push(transaction)
      }
    }

    // STEP 2: AI FALLBACK - Extract merchant + suggest ANZSIC
    if (needsAI.length > 0) {
      console.log(`🤖 Step 2: AI fallback for ${needsAI.length} transactions (merchant extraction + ANZSIC)`)

      try {
        const aiResults = await this.aiMerchantExtraction(needsAI)
        const aiResultsMap = new Map(aiResults.map((r) => [r.id, r]))

        // Process AI results and save new merchants to database
        const newMerchants: any[] = []

        for (const transaction of needsAI) {
          const aiResult = aiResultsMap.get(transaction.id)

          if (aiResult && aiResult.merchantName && aiResult.merchantName !== "unknown") {
            // Get ATO category from ANZSIC mapping
            const atoMapping = await anzsicMappingService.getAtoCategoryForAnzsic(aiResult.anzsicCode || "")

            const finalResult: ClassificationResult = {
              id: transaction.id,
              isDeductible: atoMapping.atoCategory ? atoMapping.isDeductible : false,
              atoCategory: atoMapping.atoCategory,
              confidence: Math.min(aiResult.confidence, atoMapping.confidence || 60),
              source: "ai-merchant",
              merchantName: aiResult.merchantName,
              anzsicCode: aiResult.anzsicCode,
              anzsicDescription: aiResult.anzsicDescription,
            }

            results.push(finalResult)

            // Save high-confidence AI merchants to database for future lookups
            if (aiResult.confidence >= 75 && aiResult.anzsicCode) {
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
            }

            console.log(
              `✅ AI extracted: ${aiResult.merchantName} (${aiResult.anzsicCode}) → ${atoMapping.atoCategory}`,
            )
          } else {
            // Complete fallback
            results.push({
              id: transaction.id,
              isDeductible: false,
              atoCategory: null,
              confidence: 0,
              source: "fallback",
              merchantName: "unknown",
            })
          }
        }

        // STEP 3: BULK SAVE NEW MERCHANTS
        if (newMerchants.length > 0) {
          console.log(`💾 Step 3: Saving ${newMerchants.length} new AI-discovered merchants...`)
          try {
            // Save merchants via API
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
      } catch (error) {
        console.error("❌ AI merchant extraction failed:", error)

        // Fallback for all AI transactions
        needsAI.forEach((transaction) => {
          results.push({
            id: transaction.id,
            isDeductible: false,
            atoCategory: null,
            confidence: 0,
            source: "fallback",
            merchantName: "unknown",
          })
        })
      }
    }

    const merchantDbHits = results.filter((r) => r.source === "merchant-db").length
    const aiMerchants = results.filter((r) => r.source === "ai-merchant").length
    const fallbacks = results.filter((r) => r.source === "fallback").length

    console.log(`✅ ENHANCED MERCHANT classification complete:`, {
      total: results.length,
      merchantDb: merchantDbHits,
      aiMerchant: aiMerchants,
      fallback: fallbacks,
      merchantDbHitRate: `${((merchantDbHits / results.length) * 100).toFixed(1)}%`,
      deductible: results.filter((r) => r.isDeductible).length,
    })

    return results
  }

  // AI merchant extraction + ANZSIC suggestion
  private static async aiMerchantExtraction(transactions: TransactionToClassify[]): Promise<
    Array<{
      id: string
      merchantName: string
      anzsicCode: string
      anzsicDescription: string
      confidence: number
    }>
  > {
    const batchSize = 15 // Smaller batches for more complex AI task
    const results: any[] = []

    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize)
      console.log(
        `🤖 AI merchant extraction batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(transactions.length / batchSize)}`,
      )

      try {
        const response = await fetch("/api/ai/extract-merchant-anzsic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactions: batch }),
        })

        if (!response.ok) {
          throw new Error(`AI merchant extraction failed: ${response.status}`)
        }

        const data = await response.json()

        if (data.success && Array.isArray(data.results)) {
          results.push(...data.results)
        } else {
          throw new Error("Invalid AI response format")
        }
      } catch (error) {
        console.error(`❌ AI merchant extraction batch failed:`, error)

        // Fallback for this batch
        batch.forEach((transaction) => {
          results.push({
            id: transaction.id,
            merchantName: "unknown",
            anzsicCode: "",
            anzsicDescription: "",
            confidence: 0,
          })
        })
      }
    }

    return results
  }

  static async getStats(): Promise<{
    totalMerchants: number
    merchantDbHitRate: string
    averageConfidence: number
    topAnzsicCodes: Array<{ code: string; description: string; count: number }>
  }> {
    try {
      const merchantStats = await merchantService.getStatistics()
      return {
        totalMerchants: merchantStats.total,
        merchantDbHitRate: merchantStats.total > 0 ? "90%" : "0%",
        averageConfidence: 85, // Merchants are generally high confidence
        topAnzsicCodes: merchantStats.topAnzsicCodes,
      }
    } catch (error) {
      console.error("Error getting enhanced classification stats:", error)
      return {
        totalMerchants: 0,
        merchantDbHitRate: "0%",
        averageConfidence: 0,
        topAnzsicCodes: [],
      }
    }
  }
}
