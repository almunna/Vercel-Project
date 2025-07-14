// Ultra-optimized transaction processing service
export class TransactionProcessor {
  private static instance: TransactionProcessor
  private processingQueue: Map<string, Promise<any>> = new Map()
  private cache = new Map<string, any>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  static getInstance(): TransactionProcessor {
    if (!TransactionProcessor.instance) {
      TransactionProcessor.instance = new TransactionProcessor()
    }
    return TransactionProcessor.instance
  }

  // Deduplicate processing requests
  async processTransactions(transactions: any[], options: any = {}): Promise<any> {
    const cacheKey = this.generateCacheKey(transactions, options)

    // Check if already processing
    if (this.processingQueue.has(cacheKey)) {
      console.log("🔄 Reusing existing processing request")
      return await this.processingQueue.get(cacheKey)
    }

    // Check cache
    const cached = this.getCached(cacheKey)
    if (cached) {
      console.log("⚡ Returning cached result")
      return cached
    }

    // Start new processing
    const processingPromise = this.doProcessTransactions(transactions, options)
    this.processingQueue.set(cacheKey, processingPromise)

    try {
      const result = await processingPromise
      this.setCached(cacheKey, result)
      return result
    } finally {
      this.processingQueue.delete(cacheKey)
    }
  }

  private async doProcessTransactions(transactions: any[], options: any): Promise<any> {
    const startTime = Date.now()
    console.log(`🚀 Processing ${transactions.length} transactions with optimizations`)

    // Batch process in chunks for better memory management
    const CHUNK_SIZE = 50
    const chunks = this.chunkArray(transactions, CHUNK_SIZE)
    const results: any[] = []

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      console.log(`📦 Processing chunk ${i + 1}/${chunks.length} (${chunk.length} transactions)`)

      try {
        // Process chunk with optimized merchant classification
        const chunkResults = await this.processChunk(chunk)
        results.push(...chunkResults)

        // Small delay to prevent overwhelming the system
        if (i < chunks.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 10))
        }
      } catch (error) {
        console.error(`❌ Error processing chunk ${i + 1}:`, error)
        // Continue with other chunks
        results.push(...chunk.map((t) => ({ ...t, error: "Processing failed" })))
      }
    }

    const processingTime = Date.now() - startTime
    console.log(`✅ Completed processing in ${processingTime}ms`)

    return {
      transactions: results,
      stats: {
        total: results.length,
        processingTime,
        chunksProcessed: chunks.length,
      },
    }
  }

  private async processChunk(transactions: any[]): Promise<any[]> {
    // Use the optimized merchant classification API
    try {
      const response = await fetch("/api/merchants/bulk-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactions: transactions.map((t) => ({
            id: t.id,
            description: t.description,
            amount: t.amount,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const result = await response.json()

      // Merge classification results with original transactions
      const classificationMap = new Map(result.results?.map((r: any) => [r.id, r]) || [])

      return transactions.map((transaction) => {
        const classification = classificationMap.get(transaction.id)
        return {
          ...transaction,
          merchantName: classification?.merchantName,
          anzsicCode: classification?.anzsicCode,
          atoCategory: classification?.atoCategory,
          isDeductible: classification?.isDeductible || false,
          confidence: classification?.confidence || 0,
          autoClassified: !!classification,
        }
      })
    } catch (error) {
      console.error("Chunk processing error:", error)
      // Return transactions without classification
      return transactions.map((t) => ({ ...t, autoClassified: false }))
    }
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }

  private generateCacheKey(transactions: any[], options: any): string {
    const transactionIds = transactions
      .map((t) => t.id)
      .sort()
      .join(",")
    const optionsStr = JSON.stringify(options)
    return `${transactionIds}-${optionsStr}`.substring(0, 100) // Limit key length
  }

  private getCached(key: string): any {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }
    this.cache.delete(key)
    return null
  }

  private setCached(key: string, data: any): void {
    // Limit cache size
    if (this.cache.size > 100) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  // Clean up resources
  clearCache(): void {
    this.cache.clear()
    this.processingQueue.clear()
    console.log("🧹 Transaction processor cache cleared")
  }
}
