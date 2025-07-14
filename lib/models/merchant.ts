import { MERCHANT_MAPPINGS } from "@/lib/data/merchant-mappings"

export interface MerchantResult {
  merchantName: string
  anzsicCode: string
  confidence: number
}

class MerchantModel {
  // Blacklist words that should never be considered business expenses
  private static readonly BLACKLIST_WORDS = [
    // Payment methods
    "bpay",
    "payid",
    "osko",

    // Banking terms
    "withdrawal",
    "deposit",
    "transfer",
    "fee",
    "charge",
    "interest",
    "dividend",
    "refund",
    "reversal",
    "adjustment",
    "correction",

    // ATM/Card terms
    "atm",
    "eftpos",
    "visa",
    "mastercard",
    "amex",

    // Government/Tax
    "ato",
    "centrelink",
    "medicare",
    "rms",
    "vicroads",

    // Personal/Non-business
    "supermarket",
    "grocery",
    "personal",
    "private",
  ]

  // Extract merchant from transaction description with precise word matching
  extractFromDescription(description: string, amount?: string | number): MerchantResult {
    const cleanDesc = description.toLowerCase().trim()
    console.log(`🔍 Analyzing description: "${description}"`)

    // Step 0: Check if amount is positive (income/credits are never deductible)
    if (amount !== undefined) {
      const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
      if (numAmount > 0) {
        console.log(`💰 Positive amount detected (${numAmount}) - automatically non-deductible`)
        return {
          merchantName: "Income/Credit Transaction",
          anzsicCode: "9999",
          confidence: 100,
        }
      }
    }

    // Step 1: Check for specific merchant patterns first (highest priority)
    const specificMatch = this.findSpecificMerchantPatterns(description)
    if (specificMatch) {
      console.log(`✅ Specific pattern match: ${specificMatch.merchantName} -> ${specificMatch.anzsicCode}`)
      return specificMatch
    }

    // Step 2: Check blacklist - if any blacklist word is found, mark as non-deductible
    const blacklistMatch = this.checkBlacklist(cleanDesc)
    if (blacklistMatch) {
      console.log(`❌ Blacklisted: Found "${blacklistMatch}" in description`)
      return {
        merchantName: "Non-Deductible Transaction",
        anzsicCode: "9999",
        confidence: 100,
      }
    }

    // Step 3: Handle special deposit cases (like Shopify deposits)
    const depositMatch = this.handleDepositTransactions(description)
    if (depositMatch) {
      console.log(`💳 Deposit transaction: ${depositMatch.merchantName} -> ${depositMatch.anzsicCode}`)
      return depositMatch
    }

    // Step 4: Extract clean words from description
    const cleanWords = this.extractCleanWords(cleanDesc)
    console.log(`🔍 Clean words extracted: ${cleanWords.join(", ")}`)

    // Step 5: Direct word matching in merchant mappings
    const directMatch = this.findDirectMatch(cleanWords)
    if (directMatch) {
      console.log(`✅ Direct match: ${directMatch.merchantName} -> ${directMatch.anzsicCode}`)
      return directMatch
    }

    // Step 6: Pattern-based extraction for common transaction formats
    const patternMatch = this.extractFromPattern(description)
    if (patternMatch) {
      console.log(`✅ Pattern match: ${patternMatch.merchantName} -> ${patternMatch.anzsicCode}`)
      return patternMatch
    }

    // Step 7: Known variations and abbreviations
    const variationMatch = this.findKnownVariation(cleanWords)
    if (variationMatch) {
      console.log(
        `✅ Variation match: "${variationMatch.variation}" -> ${variationMatch.merchantName} (${variationMatch.anzsicCode})`,
      )
      return {
        merchantName: this.formatMerchantName(variationMatch.merchantName),
        anzsicCode: variationMatch.anzsicCode,
        confidence: 85,
      }
    }

    // Default: Unknown merchant (non-deductible)
    const genericMerchant = this.extractGenericMerchant(cleanWords)
    console.log(`❌ No match found, using generic: ${genericMerchant}`)
    return {
      merchantName: genericMerchant,
      anzsicCode: "9999",
      confidence: 30,
    }
  }

  // Find specific merchant patterns (highest priority matching)
  private findSpecificMerchantPatterns(description: string): MerchantResult | null {
    const desc = description.toLowerCase()

    // Shopify patterns (handle all variations)
    if (/shopify/i.test(description)) {
      return {
        merchantName: "Shopify",
        anzsicCode: "7000",
        confidence: 95,
      }
    }

    // Instantly patterns
    if (/\binstantly\b/i.test(description)) {
      return {
        merchantName: "Instantly",
        anzsicCode: "7000",
        confidence: 95,
      }
    }

    // Plus500 patterns
    if (/plus500/i.test(description)) {
      return {
        merchantName: "Plus500",
        anzsicCode: "6231",
        confidence: 95,
      }
    }

    // Optus patterns
    if (/optus/i.test(description)) {
      return {
        merchantName: "Optus",
        anzsicCode: "5910",
        confidence: 95,
      }
    }

    // Telstra patterns
    if (/telstra/i.test(description)) {
      return {
        merchantName: "Telstra",
        anzsicCode: "5910",
        confidence: 95,
      }
    }

    // Uber patterns
    if (/uber/i.test(description)) {
      if (/uber\s*eats/i.test(description)) {
        return {
          merchantName: "Uber Eats",
          anzsicCode: "5223",
          confidence: 95,
        }
      }
      return {
        merchantName: "Uber",
        anzsicCode: "7220",
        confidence: 95,
      }
    }

    // McDonald's patterns
    if (/mcdonald|maccas|macca(?!roni)/i.test(description)) {
      return {
        merchantName: "McDonald's",
        anzsicCode: "5613",
        confidence: 95,
      }
    }

    // Woolworths patterns
    if (/woolworths|woolies/i.test(description)) {
      return {
        merchantName: "Woolworths",
        anzsicCode: "4711",
        confidence: 95,
      }
    }

    // Coles patterns
    if (/\bcoles\b/i.test(description)) {
      return {
        merchantName: "Coles",
        anzsicCode: "4711",
        confidence: 95,
      }
    }

    // JB Hi-Fi patterns
    if (/jb\s*hi-?fi|jbhifi/i.test(description)) {
      return {
        merchantName: "JB Hi-Fi",
        anzsicCode: "4252",
        confidence: 95,
      }
    }

    // Harvey Norman patterns
    if (/harvey\s*norman/i.test(description)) {
      return {
        merchantName: "Harvey Norman",
        anzsicCode: "4252",
        confidence: 95,
      }
    }

    // Bunnings patterns
    if (/bunnings/i.test(description)) {
      return {
        merchantName: "Bunnings",
        anzsicCode: "4390",
        confidence: 95,
      }
    }

    // Fuel station patterns
    if (/\b(shell|bp|caltex|mobil|ampol|esso|7-?eleven)\b/i.test(description)) {
      const match = description.match(/\b(shell|bp|caltex|mobil|ampol|esso|7-?eleven)\b/i)
      if (match) {
        return {
          merchantName: this.formatMerchantName(match[1]),
          anzsicCode: "4613",
          confidence: 95,
        }
      }
    }

    return null
  }

  // Direct matching against merchant mappings
  private findDirectMatch(words: string[]): MerchantResult | null {
    // Check each word against merchant mappings
    for (const word of words) {
      if (MERCHANT_MAPPINGS[word]) {
        return {
          merchantName: this.formatMerchantName(word),
          anzsicCode: MERCHANT_MAPPINGS[word],
          confidence: 90,
        }
      }
    }

    // Check combinations of words
    for (let i = 0; i < words.length - 1; i++) {
      const twoWords = `${words[i]} ${words[i + 1]}`
      if (MERCHANT_MAPPINGS[twoWords]) {
        return {
          merchantName: this.formatMerchantName(twoWords),
          anzsicCode: MERCHANT_MAPPINGS[twoWords],
          confidence: 95,
        }
      }
    }

    return null
  }

  // Handle deposit transactions (like Shopify deposits which are business income)
  private handleDepositTransactions(description: string): MerchantResult | null {
    const depositMatch = description.match(/^deposit\s+(.+?)(?:\s+[a-z0-9-]+)?$/i)
    if (depositMatch) {
      const merchantName = depositMatch[1].trim().toLowerCase()

      // Check if the merchant in the deposit is in our mappings
      if (MERCHANT_MAPPINGS[merchantName]) {
        // For business platforms like Shopify, deposits are business income (deductible as revenue)
        const businessPlatforms = ["shopify", "stripe", "square", "paypal", "etsy", "amazon", "ebay"]
        if (businessPlatforms.includes(merchantName)) {
          return {
            merchantName: `${this.formatMerchantName(merchantName)} Deposit`,
            anzsicCode: MERCHANT_MAPPINGS[merchantName],
            confidence: 95,
          }
        }
      }

      // For other deposits, extract the merchant name but mark as income
      return {
        merchantName: `${this.formatMerchantName(merchantName)} Deposit`,
        anzsicCode: "9999", // Income - not deductible
        confidence: 80,
      }
    }

    return null
  }

  // Check if description contains any blacklisted words
  private checkBlacklist(description: string): string | null {
    const words = description.split(/\s+/)

    for (const word of words) {
      const cleanWord = word.replace(/[^a-z0-9]/g, "")
      if (MerchantModel.BLACKLIST_WORDS.includes(cleanWord)) {
        return cleanWord
      }
    }

    return null
  }

  // Extract clean, meaningful words from transaction description
  private extractCleanWords(description: string): string[] {
    // Remove common transaction prefixes and suffixes
    const cleaned = description
      .replace(
        /^(debit card purchase|eftpos debit|card purchase|purchase|payment by authority to|payment to|payment|transfer to|transfer|direct debit|dd|deposit)\s*/i,
        "",
      )
      .replace(/\s*(aus|australia|sydney|melbourne|brisbane|perth|adelaide|usa|usd|incl|fore)$/i, "")
      .replace(/\s*\*.*$/, "") // Remove everything after *
      .replace(/-[a-z0-9]+$/i, "") // Remove trailing reference codes like -L7N7dwct6J
      .replace(/\d{2,}/g, "") // Remove long numbers
      .replace(/[\\/*[\](){}]+/g, " ") // Replace special characters with spaces
      .trim()

    // Split into words and filter
    return cleaned
      .split(/[\s\-_*\\/[\](){}]+/) // Include more separators
      .map((word) => word.replace(/[^a-z0-9]/g, ""))
      .filter(
        (word) =>
          word.length >= 2 &&
          ![
            "the",
            "and",
            "for",
            "with",
            "from",
            "ltd",
            "pty",
            "co",
            "inc",
            "by",
            "to",
            "authority",
            "incl",
            "usd",
            "usa",
            "aus",
            "fore",
            "debit",
            "card",
            "purchase",
            "eftpos",
          ].includes(word),
      )
  }

  // Find known variations and abbreviations (controlled list)
  private findKnownVariation(words: string[]): { variation: string; merchantName: string; anzsicCode: string } | null {
    // Controlled variations mapping - only add known, verified variations
    const knownVariations: Record<string, string> = {
      // McDonald's variations
      maccas: "mcdonald",
      macca: "mcdonald",
      mcd: "mcdonald",
      mcdonalds: "mcdonald",

      // Supermarkets
      woolies: "woolworths",

      // Electronics
      jbhifi: "jb hi-fi",
      ofw: "officeworks",

      // Fuel stations
      "7eleven": "7-eleven",
      "711": "7-eleven",

      // Transport
      "13cabs": "13cabs",
      gocatch: "gocatch",

      // Coffee
      starbucks: "starbucks",

      // Airlines
      qantas: "qantas",
      jetstar: "jetstar",
      virgin: "virgin australia",
      tigerair: "tigerair",

      // Telecommunications
      optus: "optus",
      telstra: "telstra",

      // Business platforms
      shopify: "shopify",
      paypal: "paypal",
      stripe: "stripe",
    }

    for (const word of words) {
      const canonical = knownVariations[word]
      if (canonical && MERCHANT_MAPPINGS[canonical]) {
        return {
          variation: word,
          merchantName: canonical,
          anzsicCode: MERCHANT_MAPPINGS[canonical],
        }
      }
    }

    return null
  }

  // Extract merchant from common transaction patterns
  private extractFromPattern(description: string): MerchantResult | null {
    // Pattern 1: "Payment By Authority To [Merchant]" - extract the merchant after "to"
    const authorityMatch = description.match(/payment\s+by\s+authority\s+to\s+(.+?)(?:\s+aus|\s+australia|$)/i)
    if (authorityMatch) {
      const merchantName = authorityMatch[1].trim()
      console.log(`🏛️ Authority payment detected: "${merchantName}"`)

      // Check if this merchant is in our mappings (prioritize specific matches)
      const merchantLower = merchantName.toLowerCase()

      // First, try to find exact match
      if (MERCHANT_MAPPINGS[merchantLower]) {
        return {
          merchantName: this.formatMerchantName(merchantLower),
          anzsicCode: MERCHANT_MAPPINGS[merchantLower],
          confidence: 95,
        }
      }

      // Then try to find partial matches (but be careful about specificity)
      const sortedMerchants = Object.entries(MERCHANT_MAPPINGS).sort(([a], [b]) => b.length - a.length)
      for (const [merchantKey, anzsicCode] of sortedMerchants) {
        if (merchantLower.includes(merchantKey.toLowerCase()) || merchantKey.toLowerCase().includes(merchantLower)) {
          // Additional validation: make sure it's a reasonable match
          const similarity = this.calculateSimilarity(merchantLower, merchantKey.toLowerCase())
          if (similarity > 0.6) {
            return {
              merchantName: this.formatMerchantName(merchantKey),
              anzsicCode,
              confidence: Math.floor(similarity * 100),
            }
          }
        }
      }

      // If no match found, treat as unknown merchant
      return {
        merchantName: this.formatMerchantName(merchantName),
        anzsicCode: "9999",
        confidence: 60,
      }
    }

    // Pattern 2: "SMP*" prefix (Square/Stripe merchants)
    const smpMatch = description.match(/smp\*([a-z\s]+)/i)
    if (smpMatch) {
      const merchantName = smpMatch[1].trim()
      // Don't try to match SMP merchants to our database - they're usually small businesses
      return {
        merchantName: this.formatMerchantName(merchantName),
        anzsicCode: "9999", // Default to non-deductible unless manually classified
        confidence: 60,
      }
    }

    // Pattern 3: Transport NSW (specific case)
    if (/transportfornsw|transport\s*for\s*nsw/i.test(description)) {
      return {
        merchantName: "Transport for NSW",
        anzsicCode: "7220", // Public transport
        confidence: 95,
      }
    }

    // Pattern 4: Government agencies
    if (/\b(rms|vicroads|qld\s*transport|sa\s*transport)\b/i.test(description)) {
      return {
        merchantName: "Government Transport",
        anzsicCode: "9999", // Government services (non-deductible)
        confidence: 90,
      }
    }

    return null
  }

  // Calculate similarity between two strings (simple implementation)
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1

    if (longer.length === 0) return 1.0

    const editDistance = this.levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  // Calculate Levenshtein distance between two strings
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = []

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1, // deletion
          )
        }
      }
    }

    return matrix[str2.length][str1.length]
  }

  // Extract generic merchant name as fallback
  private extractGenericMerchant(words: string[]): string {
    // Take the first 1-2 meaningful words
    const meaningfulWords = words.filter(
      (word) => word.length > 2 && !["card", "purchase", "payment", "debit", "credit"].includes(word),
    )

    if (meaningfulWords.length > 0) {
      return meaningfulWords.slice(0, 2).join(" ").substring(0, 30)
    }

    return "Unknown Merchant"
  }

  // Format merchant name for display
  private formatMerchantName(merchantKey: string): string {
    return merchantKey
      .split(/[\s-]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Bulk operations for database compatibility
  async getAll(): Promise<Array<{ merchantName: string; anzsicCode: string; keywords: string[]; aliases: string[] }>> {
    return Object.entries(MERCHANT_MAPPINGS).map(([merchantName, anzsicCode]) => ({
      merchantName,
      displayName: this.formatMerchantName(merchantName),
      anzsicCode,
      keywords: [merchantName.toLowerCase()],
      aliases: [],
      source: "static" as const,
      confidence: 100,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  }

  async bulkCreate(merchants: Array<{ merchantName: string; anzsicCode: string }>): Promise<void> {
    // Static model doesn't support bulk create - would need database implementation
    console.log(`📝 Note: ${merchants.length} merchants would be saved in database implementation`)
  }

  async getStats() {
    return {
      totalMerchants: Object.keys(MERCHANT_MAPPINGS).length,
      blacklistedTerms: MerchantModel.BLACKLIST_WORDS.length,
      dataSource: "static-with-enhanced-matching",
    }
  }

  // Test method to validate merchant matching
  testMerchantMatching(
    testCases: Array<{
      description: string
      amount?: number
      expectedMerchant?: string
      expectedAnzsic?: string
      shouldNotMatch?: string
    }>,
  ) {
    console.log("🧪 Testing enhanced merchant matching...")

    testCases.forEach(({ description, amount, expectedMerchant, expectedAnzsic, shouldNotMatch }) => {
      const result = this.extractFromDescription(description, amount)

      let passed = true
      let reason = ""

      if (expectedMerchant && !result.merchantName.toLowerCase().includes(expectedMerchant.toLowerCase())) {
        passed = false
        reason += `Expected merchant "${expectedMerchant}", got "${result.merchantName}". `
      }

      if (expectedAnzsic && result.anzsicCode !== expectedAnzsic) {
        passed = false
        reason += `Expected ANZSIC "${expectedAnzsic}", got "${result.anzsicCode}". `
      }

      if (shouldNotMatch && result.merchantName.toLowerCase().includes(shouldNotMatch.toLowerCase())) {
        passed = false
        reason += `Should NOT match "${shouldNotMatch}" but got "${result.merchantName}". `
      }

      console.log(
        `${passed ? "✅" : "❌"} "${description}"${amount !== undefined ? ` ($${amount})` : ""} -> ${result.merchantName} (${result.anzsicCode}) [confidence: ${result.confidence}]${!passed ? ` - ${reason}` : ""}`,
      )
    })
  }
}

export const merchantModel = new MerchantModel()

// Test the enhanced matching with your specific examples
if (typeof window !== "undefined") {
  // Only run tests in browser environment
  setTimeout(() => {
    merchantModel.testMerchantMatching([
      {
        description: "Debit Card Purchase Instantly Sheridan Usa Usd incl. Fore...",
        expectedMerchant: "Instantly",
        expectedAnzsic: "7000",
      },
      {
        description: "Eftpos Debit Shopify* \\ /",
        expectedMerchant: "Shopify",
        expectedAnzsic: "7000",
      },
      {
        description: "Deposit Shopify Shopify-L7N7dwct6J",
        expectedMerchant: "Shopify",
        expectedAnzsic: "7000",
      },
      {
        description: "Debit Card Purchase Plus500 Valletta Aus",
        expectedMerchant: "Plus500",
        expectedAnzsic: "6231",
      },
      {
        description: "Payment By Authority To Booking.com",
        expectedMerchant: "Booking.com",
        expectedAnzsic: "4400",
      },
      {
        description: "Direct Debit Optus Mobile Services",
        expectedMerchant: "Optus",
        expectedAnzsic: "5910",
      },
    ])
  }, 1000)
}
