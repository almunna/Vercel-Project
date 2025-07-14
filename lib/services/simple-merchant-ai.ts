import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

interface MerchantAIResult {
  merchantName: string
  anzsicCode: string
}

export class SimpleMerchantAI {
  static async extractMerchant(description: string): Promise<MerchantAIResult | null> {
    try {
      console.log(`🤖 AI extracting merchant from: "${description}"`)

      const prompt = `Extract the merchant name and ANZSIC code from this transaction description.

Transaction: "${description}"

Common ANZSIC codes:
- 4613: Motor vehicle fuel retailing (Shell, BP, Caltex, 7-Eleven)
- 4711: Supermarket and grocery stores (Coles, Woolworths, IGA)
- 5621: Takeaway food services (McDonald's, KFC, Subway, Dominos)
- 4521: Hardware and building supplies (Bunnings, Masters)
- 4252: Electronics retailing (JB Hi-Fi, Harvey Norman)
- 6920: Accounting services
- 6910: Legal services
- 7220: Taxi and transport (Uber, taxi)
- 4512: Cafes and restaurants
- 4615: Other store-based retailing

Return ONLY JSON in this exact format:
{
  "merchantName": "business name",
  "anzsicCode": "4711"
}

If you cannot identify a clear merchant, return:
{
  "merchantName": "Unknown",
  "anzsicCode": "9999"
}`

      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        temperature: 0.1,
        maxTokens: 200,
      })

      console.log(`🤖 Raw AI response: ${text}`)

      // Clean the response - remove any markdown formatting
      const cleanedText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim()
      console.log(`🧹 Cleaned AI response: ${cleanedText}`)

      // Parse AI response
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.log("❌ No JSON found in AI response")
        return null
      }

      const result = JSON.parse(jsonMatch[0])
      console.log(`📋 Parsed AI result:`, result)

      if (
        !result.merchantName ||
        !result.anzsicCode ||
        result.merchantName === "Unknown" ||
        result.anzsicCode === "9999"
      ) {
        console.log("❌ AI could not identify merchant")
        return null
      }

      // Validate ANZSIC code format (should be 4 digits)
      if (!/^\d{4}$/.test(result.anzsicCode)) {
        console.log(`❌ Invalid ANZSIC code format: ${result.anzsicCode}`)
        return null
      }

      console.log(`✅ AI extracted: ${result.merchantName} (${result.anzsicCode})`)
      return {
        merchantName: result.merchantName.trim(),
        anzsicCode: result.anzsicCode.trim(),
      }
    } catch (error) {
      console.error("❌ AI merchant extraction failed:", error)
      return null
    }
  }
}
