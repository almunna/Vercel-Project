import {
  findAnzsicByCode,
  getAllAnzsicCodes,
  getDeductibleAnzsicCodes,
  type AnzsicMapping,
} from "@/lib/data/anzsic-mappings"

// Simple ANZSIC model - NO DATABASE
export type { AnzsicMapping }

export const anzsicModel = {
  // Find ANZSIC mapping by code (LEFT JOIN equivalent)
  findByCode(anzsicCode: string): AnzsicMapping | null {
    return findAnzsicByCode(anzsicCode)
  },

  // Get category and deductibility for an ANZSIC code
  getCategoryInfo(anzsicCode: string): { atoCategory: string; isDeductible: boolean } {
    const mapping = findAnzsicByCode(anzsicCode)
    if (mapping) {
      return {
        atoCategory: mapping.atoCategory,
        isDeductible: mapping.isDeductible,
      }
    }
    // Default fallback
    return {
      atoCategory: "Other",
      isDeductible: false,
    }
  },

  // Get all ANZSIC codes
  getAll(): AnzsicMapping[] {
    return getAllAnzsicCodes()
  },

  // Get only deductible codes
  getDeductible(): AnzsicMapping[] {
    return getDeductibleAnzsicCodes()
  },

  // Get statistics
  getStats() {
    const codes = getAllAnzsicCodes()
    const deductible = codes.filter((c) => c.isDeductible)
    const categories = new Set(codes.map((c) => c.atoCategory))

    return {
      totalMappings: codes.length,
      deductibleMappings: deductible.length,
      nonDeductibleMappings: codes.length - deductible.length,
      uniqueCategories: categories.size,
    }
  },
}
