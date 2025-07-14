import { connectToDatabase } from "../lib/mongodb"
import type { KeywordMappingCreate } from "../lib/models/keyword-mapping"

const initialKeywords: KeywordMappingCreate[] = [
  // Vehicles, Travel & Transport
  { keyword: "fuel", status: "deductible", atoCategory: "Vehicles, Travel & Transport", confidenceLevel: 85 },
  { keyword: "petrol", status: "deductible", atoCategory: "Vehicles, Travel & Transport", confidenceLevel: 85 },
  { keyword: "parking", status: "deductible", atoCategory: "Vehicles, Travel & Transport", confidenceLevel: 80 },
  { keyword: "toll", status: "deductible", atoCategory: "Vehicles, Travel & Transport", confidenceLevel: 90 },
  { keyword: "uber", status: "deductible", atoCategory: "Vehicles, Travel & Transport", confidenceLevel: 90 },
  { keyword: "taxi", status: "deductible", atoCategory: "Vehicles, Travel & Transport", confidenceLevel: 90 },
  { keyword: "car rental", status: "deductible", atoCategory: "Vehicles, Travel & Transport", confidenceLevel: 85 },
  { keyword: "flight", status: "deductible", atoCategory: "Vehicles, Travel & Transport", confidenceLevel: 85 },
  { keyword: "hotel", status: "deductible", atoCategory: "Vehicles, Travel & Transport", confidenceLevel: 80 },

  // Work Tools, Equipment & Technology
  { keyword: "laptop", status: "deductible", atoCategory: "Work Tools, Equipment & Technology", confidenceLevel: 90 },
  { keyword: "computer", status: "deductible", atoCategory: "Work Tools, Equipment & Technology", confidenceLevel: 90 },
  { keyword: "software", status: "deductible", atoCategory: "Work Tools, Equipment & Technology", confidenceLevel: 85 },
  {
    keyword: "microsoft",
    status: "deductible",
    atoCategory: "Work Tools, Equipment & Technology",
    confidenceLevel: 85,
  },
  { keyword: "adobe", status: "deductible", atoCategory: "Work Tools, Equipment & Technology", confidenceLevel: 85 },
  { keyword: "tools", status: "deductible", atoCategory: "Work Tools, Equipment & Technology", confidenceLevel: 80 },
  {
    keyword: "equipment",
    status: "deductible",
    atoCategory: "Work Tools, Equipment & Technology",
    confidenceLevel: 80,
  },
  { keyword: "phone", status: "deductible", atoCategory: "Work Tools, Equipment & Technology", confidenceLevel: 70 },
  { keyword: "internet", status: "deductible", atoCategory: "Work Tools, Equipment & Technology", confidenceLevel: 80 },

  // Home Office Expenses
  { keyword: "office supplies", status: "deductible", atoCategory: "Home Office Expenses", confidenceLevel: 85 },
  { keyword: "stationery", status: "deductible", atoCategory: "Home Office Expenses", confidenceLevel: 85 },
  { keyword: "printer", status: "deductible", atoCategory: "Home Office Expenses", confidenceLevel: 85 },
  { keyword: "desk", status: "deductible", atoCategory: "Home Office Expenses", confidenceLevel: 80 },
  { keyword: "chair", status: "deductible", atoCategory: "Home Office Expenses", confidenceLevel: 80 },
  { keyword: "electricity", status: "deductible", atoCategory: "Home Office Expenses", confidenceLevel: 75 },

  // Education & Training
  { keyword: "course", status: "deductible", atoCategory: "Education & Training", confidenceLevel: 85 },
  { keyword: "training", status: "deductible", atoCategory: "Education & Training", confidenceLevel: 85 },
  { keyword: "conference", status: "deductible", atoCategory: "Education & Training", confidenceLevel: 85 },
  { keyword: "seminar", status: "deductible", atoCategory: "Education & Training", confidenceLevel: 85 },
  { keyword: "workshop", status: "deductible", atoCategory: "Education & Training", confidenceLevel: 85 },
  { keyword: "certification", status: "deductible", atoCategory: "Education & Training", confidenceLevel: 85 },

  // Professional Memberships & Fees
  { keyword: "membership", status: "deductible", atoCategory: "Professional Memberships & Fees", confidenceLevel: 85 },
  {
    keyword: "subscription",
    status: "deductible",
    atoCategory: "Professional Memberships & Fees",
    confidenceLevel: 75,
  },
  {
    keyword: "professional",
    status: "deductible",
    atoCategory: "Professional Memberships & Fees",
    confidenceLevel: 80,
  },
  { keyword: "association", status: "deductible", atoCategory: "Professional Memberships & Fees", confidenceLevel: 85 },

  // Meals & Entertainment (Work-Related)
  {
    keyword: "restaurant",
    status: "deductible",
    atoCategory: "Meals & Entertainment (Work-Related)",
    confidenceLevel: 70,
  },
  { keyword: "cafe", status: "deductible", atoCategory: "Meals & Entertainment (Work-Related)", confidenceLevel: 60 },
  { keyword: "lunch", status: "deductible", atoCategory: "Meals & Entertainment (Work-Related)", confidenceLevel: 65 },
  { keyword: "dinner", status: "deductible", atoCategory: "Meals & Entertainment (Work-Related)", confidenceLevel: 65 },
  {
    keyword: "client meal",
    status: "deductible",
    atoCategory: "Meals & Entertainment (Work-Related)",
    confidenceLevel: 85,
  },

  // Tax & Accounting Expenses
  { keyword: "accountant", status: "deductible", atoCategory: "Tax & Accounting Expenses", confidenceLevel: 95 },
  { keyword: "tax agent", status: "deductible", atoCategory: "Tax & Accounting Expenses", confidenceLevel: 95 },
  { keyword: "bookkeeper", status: "deductible", atoCategory: "Tax & Accounting Expenses", confidenceLevel: 90 },
  { keyword: "tax preparation", status: "deductible", atoCategory: "Tax & Accounting Expenses", confidenceLevel: 95 },

  // Investments, Insurance & Superannuation
  {
    keyword: "insurance",
    status: "deductible",
    atoCategory: "Investments, Insurance & Superannuation",
    confidenceLevel: 80,
  },
  {
    keyword: "investment",
    status: "deductible",
    atoCategory: "Investments, Insurance & Superannuation",
    confidenceLevel: 75,
  },
  {
    keyword: "super",
    status: "deductible",
    atoCategory: "Investments, Insurance & Superannuation",
    confidenceLevel: 85,
  },
  {
    keyword: "superannuation",
    status: "deductible",
    atoCategory: "Investments, Insurance & Superannuation",
    confidenceLevel: 85,
  },

  // Common non-deductible items
  { keyword: "grocery", status: "non-deductible", atoCategory: null, confidenceLevel: 95 },
  { keyword: "groceries", status: "non-deductible", atoCategory: null, confidenceLevel: 95 },
  { keyword: "supermarket", status: "non-deductible", atoCategory: null, confidenceLevel: 95 },
  { keyword: "woolworths", status: "non-deductible", atoCategory: null, confidenceLevel: 90 },
  { keyword: "coles", status: "non-deductible", atoCategory: null, confidenceLevel: 90 },
  { keyword: "aldi", status: "non-deductible", atoCategory: null, confidenceLevel: 90 },
  { keyword: "personal", status: "non-deductible", atoCategory: null, confidenceLevel: 90 },
  { keyword: "entertainment", status: "non-deductible", atoCategory: null, confidenceLevel: 80 },
  { keyword: "movie", status: "non-deductible", atoCategory: null, confidenceLevel: 85 },
  { keyword: "cinema", status: "non-deductible", atoCategory: null, confidenceLevel: 85 },
  { keyword: "clothing", status: "non-deductible", atoCategory: null, confidenceLevel: 80 },
  { keyword: "fashion", status: "non-deductible", atoCategory: null, confidenceLevel: 80 },
  { keyword: "shopping", status: "non-deductible", atoCategory: null, confidenceLevel: 85 },
]

async function seedKeywords() {
  try {
    console.log("🌱 Seeding keyword mappings...")

    const { db } = await connectToDatabase()

    // Clear existing keywords
    await db.collection("keywordMappings").deleteMany({})

    // Insert new keywords
    const keywordsWithMetadata = initialKeywords.map((keyword) => ({
      ...keyword,
      createdAt: new Date(),
      usageCount: 0,
      source: "seed",
    }))

    const result = await db.collection("keywordMappings").insertMany(keywordsWithMetadata)

    console.log(`✅ Successfully seeded ${result.insertedCount} keyword mappings`)

    // Show summary
    const deductibleCount = initialKeywords.filter((k) => k.status === "deductible").length
    const nonDeductibleCount = initialKeywords.filter((k) => k.status === "non-deductible").length

    console.log(`📊 Summary:`)
    console.log(`   Deductible keywords: ${deductibleCount}`)
    console.log(`   Non-deductible keywords: ${nonDeductibleCount}`)
    console.log(`   Total: ${initialKeywords.length}`)
  } catch (error) {
    console.error("❌ Error seeding keywords:", error)
  }
}

// Run the seed function
seedKeywords()
