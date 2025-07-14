class AnzsicMappingService {
  // Get ATO category for ANZSIC code
  async getAtoCategoryForAnzsic(anzsicCode: string): Promise<{
    atoCategory: string | null
    isDeductible: boolean
    confidence: number
    rules: string[]
  }> {
    try {
      const response = await fetch(`/api/anzsic-mappings/lookup/${anzsicCode}`)

      if (!response.ok) {
        console.log(`No ATO mapping found for ANZSIC code: ${anzsicCode}`)
        return {
          atoCategory: null,
          isDeductible: false,
          confidence: 0,
          rules: [],
        }
      }

      const result = await response.json()
      const mapping = result.mapping

      return {
        atoCategory: mapping.atoCategory,
        isDeductible: mapping.isDeductible,
        confidence: mapping.confidenceLevel || 80,
        rules: mapping.deductibilityRules || [],
      }
    } catch (error) {
      console.error("Error getting ATO category for ANZSIC:", error)
      return {
        atoCategory: null,
        isDeductible: false,
        confidence: 0,
        rules: [],
      }
    }
  }

  // Create new ANZSIC mapping
  async createMapping(mappingData: any): Promise<any> {
    const response = await fetch("/api/anzsic-mappings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mappingData),
    })

    if (!response.ok) {
      throw new Error(`Failed to create ANZSIC mapping: ${response.status}`)
    }

    const result = await response.json()
    return result.mapping
  }

  // Get all mappings
  async getAllMappings(page = 1, limit = 50): Promise<{ mappings: any[]; total: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    const response = await fetch(`/api/anzsic-mappings?${params}`)

    if (!response.ok) {
      throw new Error(`Failed to get ANZSIC mappings: ${response.status}`)
    }

    const result = await response.json()
    return {
      mappings: result.mappings || [],
      total: result.total || 0,
    }
  }

  // Bulk create mappings
  async bulkCreateMappings(mappings: any[]): Promise<{ created: number; skipped: number }> {
    if (!mappings || mappings.length === 0) {
      return { created: 0, skipped: 0 }
    }

    try {
      const response = await fetch("/api/anzsic-mappings/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mappings }),
      })

      if (!response.ok) {
        throw new Error(`Failed to create ANZSIC mappings: ${response.status}`)
      }

      const result = await response.json()
      return {
        created: result.created || 0,
        skipped: result.skipped || 0,
      }
    } catch (error) {
      console.error("Error creating ANZSIC mappings:", error)
      throw error
    }
  }
}

export const anzsicMappingService = new AnzsicMappingService()
