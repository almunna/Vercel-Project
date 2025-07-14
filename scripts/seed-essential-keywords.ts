import clientPromise from "../lib/mongodb"

interface KeywordMapping {
  keyword: string
  status: "deductible" | "non-deductible"
  atoCategory: string | null
  confidenceLevel: number
  source: string
  description: string
  examples: string[]
  usageCount: number
  createdAt: Date
  updatedAt: Date
}

// Essential keywords based on your transaction logs
const essentialKeywords: Omit<KeywordMapping, "createdAt" | "updatedAt" | "usageCount">[] = [
  // DEDUCTIBLE - Transport & Travel
  {
    keyword: "uber",
    status: "deductible",
    atoCategory: "Vehicles, Travel & Transport",
    confidenceLevel: 85,
    source: "system",
    description: "Rideshare service for work travel",
    examples: ["Debit Card Purchase Uber *trip Sydney Aus"],
  },
  {
    keyword: "taxi",
    status: "deductible",
    atoCategory: "Vehicles, Travel & Transport",
    confidenceLevel: 90,
    source: "system",
    description: "Taxi service for work travel",
    examples: [],
  },
  {
    keyword: "fuel",
    status: "deductible",
    atoCategory: "Vehicles, Travel & Transport",
    confidenceLevel: 90,
    source: "system",
    description: "Vehicle fuel for work",
    examples: [],
  },
  {
    keyword: "petrol",
    status: "deductible",
    atoCategory: "Vehicles, Travel & Transport",
    confidenceLevel: 90,
    source: "system",
    description: "Vehicle petrol for work",
    examples: [],
  },

  // DEDUCTIBLE - Work Tools & Equipment
  {
    keyword: "laptop",
    status: "deductible",
    atoCategory: "Work Tools, Equipment & Technology",
    confidenceLevel: 90,
    source: "system",
    description: "Computer equipment for work",
    examples: [],
  },
  {
    keyword: "computer",
    status: "deductible",
    atoCategory: "Work Tools, Equipment & Technology",
    confidenceLevel: 90,
    source: "system",
    description: "Computer equipment for work",
    examples: [],
  },
  {
    keyword: "software",
    status: "deductible",
    atoCategory: "Work Tools, Equipment & Technology",
    confidenceLevel: 95,
    source: "system",
    description: "Software purchases for work",
    examples: [],
  },
  {
    keyword: "shopify",
    status: "deductible",
    atoCategory: "Work Tools, Equipment & Technology",
    confidenceLevel: 85,
    source: "system",
    description: "E-commerce platform subscription",
    examples: ["Eftpos Debit Shopify*"],
  },

  // DEDUCTIBLE - Education & Training
  {
    keyword: "conferencing",
    status: "deductible",
    atoCategory: "Education & Training",
    confidenceLevel: 90,
    source: "system",
    description: "Conference and meeting facilities",
    examples: ["Debit Card Purchase City Conferencing Cent Sydney Aus"],
  },
  {
    keyword: "conference",
    status: "deductible",
    atoCategory: "Education & Training",
    confidenceLevel: 90,
    source: "system",
    description: "Professional conferences",
    examples: [],
  },

  // DEDUCTIBLE - Home Office
  {
    keyword: "internet",
    status: "deductible",
    atoCategory: "Home Office Expenses",
    confidenceLevel: 85,
    source: "system",
    description: "Internet connection for work",
    examples: [],
  },
  {
    keyword: "phone",
    status: "deductible",
    atoCategory: "Home Office Expenses",
    confidenceLevel: 80,
    source: "system",
    description: "Phone services for work",
    examples: [],
  },

  // NON-DEDUCTIBLE - Groceries & Food
  {
    keyword: "woolworths",
    status: "non-deductible",
    atoCategory: null,
    confidenceLevel: 85,
    source: "system",
    description: "Grocery shopping",
    examples: ["Debit Card Purchase Woolworths Online Bella Vista Aus"],
  },
  {
    keyword: "coles",
    status: "non-deductible",
    atoCategory: null,
    confidenceLevel: 85,
    source: "system",
    description: "Grocery shopping",
    examples: ["Debit Card Purchase Coles 0770Coles Rose Bay Aus"],
  },
  {
    keyword: "sushi",
    status: "non-deductible",
    atoCategory: null,
    confidenceLevel: 80,
    source: "system",
    description: "Personal dining",
    examples: ["Debit Card Purchase Sushi Hub Kent St Sydney Aus"],
  },
  {
    keyword: "muscle",
    status: "non-deductible",
    atoCategory: null,
    confidenceLevel: 75,
    source: "system",
    description: "Meal delivery service",
    examples: ["Debit Card Purchase My Muscle Chef Pty Ltd Yennora Aus"],
  },

  // NON-DEDUCTIBLE - Entertainment
  {
    keyword: "netflix",
    status: "non-deductible",
    atoCategory: null,
    confidenceLevel: 85,
    source: "system",
    description: "Entertainment streaming",
    examples: [],
  },
  {
    keyword: "spotify",
    status: "non-deductible",
    atoCategory: null,
    confidenceLevel: 85,
    source: "system",
    description: "Music streaming",
    examples: [],
  },

  // LOCATION-BASED (usually non-deductible unless work-related)
  {
    keyword: "bondi",
    status: "non-deductible",
    atoCategory: null,
    confidenceLevel: 70,
    source: "system",
    description: "Location-based transaction (usually personal)",
    examples: ["Debit Card Purchase Sq *fishbowl Bondi Bondi Beach Aus"],
  },
  {
    keyword: "yennora",
    status: "non-deductible",
    atoCategory: null,
    confidenceLevel: 70,
    source: "system",
    description: "Location-based transaction",
    examples: [],
  },
]

async function seedEssentialKeywords() {
  try {
    console.log("🌱 Seeding essential keywords based on transaction logs...")

    const client = await clientPromise
    const db = client.db("taxapp")
    const collection = db.collection("keyword_mappings")

    // Create indexes
    await collection.createIndex({ keyword: 1 }, { unique: true })
    await collection.createIndex({ status: 1 })
    await collection.createIndex({ atoCategory: 1 })

    console.log("📊 Created database indexes")

    const now = new Date()
    const keywordsToInsert = essentialKeywords.map((keyword) => ({
      ...keyword,
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    }))

    console.log(`💾 Inserting ${keywordsToInsert.length} essential keywords...`)

    // Use insertMany with ordered: false to continue on duplicates
    try {
      const result = await collection.insertMany(keywordsToInsert, { ordered: false })
      console.log(`✅ Successfully inserted ${result.insertedCount} new keywords`)
    } catch (error: any) {
      if (error.code === 11000) {
        console.log("⚠️ Some keywords already exist (duplicates skipped)")
        // Count how many were actually inserted
        const totalAfter = await collection.countDocuments()
        console.log(`📊 Total keywords in database: ${totalAfter}`)
      } else {
        throw error
      }
    }

    // Verify the seeding worked
    console.log("\n🧪 Testing seeded keywords:")
    const testKeywords = ["uber", "coles", "woolworths", "shopify", "conferencing"]

    for (const keyword of testKeywords) {
      const found = await collection.findOne({ keyword: keyword.toLowerCase() })
      if (found) {
        console.log(`✅ ${keyword}: ${found.status} (${found.atoCategory || "N/A"})`)
      } else {
        console.log(`❌ ${keyword}: NOT FOUND`)
      }
    }

    // Get final stats
    const stats = await collection
      .aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray()

    console.log("\n📈 Final Statistics:")
    stats.forEach((stat) => {
      console.log(`  ${stat._id}: ${stat.count}`)
    })

    console.log("\n🎉 Essential keyword seeding completed!")
    console.log("💡 Now test your transactions again - they should match!")
  } catch (error: any) {
    console.error("❌ Error seeding essential keywords:", error)
    throw error
  }
}

// Run the seeding function
seedEssentialKeywords()
  .then(() => {
    console.log("✅ Essential seeding process completed")
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Essential seeding failed:", error)
    process.exit(1)
  })
