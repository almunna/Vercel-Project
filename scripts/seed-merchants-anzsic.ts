import { merchantModel } from "../lib/models/merchant"
import { anzsicMappingModel } from "../lib/models/anzsic-mapping"

const commonMerchants = [
  {
    merchantName: "uber",
    displayName: "Uber",
    anzsicCode: "4613",
    anzsicDescription: "Taxi and other road passenger transport",
    keywords: ["uber", "uber trip", "uber eats"],
    aliases: ["uber technologies"],
  },
  {
    merchantName: "woolworths",
    displayName: "Woolworths",
    anzsicCode: "4711",
    anzsicDescription: "Supermarket and grocery stores",
    keywords: ["woolworths", "woolies", "ww"],
    aliases: ["woolworths group"],
  },
  {
    merchantName: "coles",
    displayName: "Coles",
    anzsicCode: "4711",
    anzsicDescription: "Supermarket and grocery stores",
    keywords: ["coles", "coles supermarket"],
    aliases: ["coles group"],
  },
  {
    merchantName: "mcdonald's",
    displayName: "McDonald's",
    anzsicCode: "5621",
    anzsicDescription: "Takeaway food services",
    keywords: ["mcdonald", "mcdonalds", "maccas"],
    aliases: ["mcdonald's australia"],
  },
  {
    merchantName: "kfc",
    displayName: "KFC",
    anzsicCode: "5621",
    anzsicDescription: "Takeaway food services",
    keywords: ["kfc", "kentucky fried chicken"],
    aliases: ["kentucky fried chicken"],
  },
  {
    merchantName: "bunnings",
    displayName: "Bunnings",
    anzsicCode: "4521",
    anzsicDescription: "Hardware and building supplies retailing",
    keywords: ["bunnings", "bunnings warehouse"],
    aliases: ["bunnings group"],
  },
  {
    merchantName: "jb hi-fi",
    displayName: "JB Hi-Fi",
    anzsicCode: "4252",
    anzsicDescription: "Electrical, electronic and gas appliance retailing",
    keywords: ["jb hi-fi", "jbhifi", "jb hifi"],
    aliases: ["jb hi-fi limited"],
  },
  {
    merchantName: "harvey norman",
    displayName: "Harvey Norman",
    anzsicCode: "4252",
    anzsicDescription: "Electrical, electronic and gas appliance retailing",
    keywords: ["harvey norman", "harvey norman stores"],
    aliases: ["harvey norman holdings"],
  },
]

const anzsicMappings = [
  {
    anzsicCode: "4613",
    anzsicDescription: "Taxi and other road passenger transport",
    atoCategory: "Vehicles, Travel & Transport",
    isDeductible: true,
    confidenceLevel: 90,
    deductibilityRules: ["Business travel", "Work-related transport"],
    examples: ["Uber for business meetings", "Taxi to airport for work"],
    source: "manual" as const,
  },
  {
    anzsicCode: "4711",
    anzsicDescription: "Supermarket and grocery stores",
    atoCategory: "Meals & Entertainment (Work-Related)",
    isDeductible: false,
    confidenceLevel: 95,
    deductibilityRules: ["Generally not deductible unless for business entertainment"],
    examples: ["Office supplies from supermarket", "Client entertainment food"],
    source: "manual" as const,
  },
  {
    anzsicCode: "5621",
    anzsicDescription: "Takeaway food services",
    atoCategory: "Meals & Entertainment (Work-Related)",
    isDeductible: true,
    confidenceLevel: 85,
    deductibilityRules: ["Business meals", "Client entertainment", "Working overtime meals"],
    examples: ["Lunch during business meeting", "Dinner while working late"],
    source: "manual" as const,
  },
  {
    anzsicCode: "4521",
    anzsicDescription: "Hardware and building supplies retailing",
    atoCategory: "Work Tools, Equipment & Technology",
    isDeductible: true,
    confidenceLevel: 90,
    deductibilityRules: ["Tools for work", "Equipment for business"],
    examples: ["Tools for tradesperson", "Office furniture"],
    source: "manual" as const,
  },
  {
    anzsicCode: "4252",
    anzsicDescription: "Electrical, electronic and gas appliance retailing",
    atoCategory: "Work Tools, Equipment & Technology",
    isDeductible: true,
    confidenceLevel: 85,
    deductibilityRules: ["Work-related electronics", "Business equipment"],
    examples: ["Computer for work", "Phone for business use"],
    source: "manual" as const,
  },
  {
    anzsicCode: "6920",
    anzsicDescription: "Accounting services",
    atoCategory: "Tax & Accounting Expenses",
    isDeductible: true,
    confidenceLevel: 100,
    deductibilityRules: ["Tax preparation", "Accounting services", "Bookkeeping"],
    examples: ["Accountant fees", "Tax return preparation"],
    source: "manual" as const,
  },
  {
    anzsicCode: "6910",
    anzsicDescription: "Legal services",
    atoCategory: "Professional Memberships & Fees",
    isDeductible: true,
    confidenceLevel: 90,
    deductibilityRules: ["Work-related legal advice", "Business legal services"],
    examples: ["Contract review", "Employment law advice"],
    source: "manual" as const,
  },
]

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...")

    // Seed ANZSIC mappings
    console.log("📋 Seeding ANZSIC mappings...")
    const mappingResult = await anzsicMappingModel.bulkCreate(anzsicMappings)
    console.log(`✅ ANZSIC mappings: ${mappingResult.created} created, ${mappingResult.skipped} skipped`)

    // Seed merchants
    console.log("🏪 Seeding merchants...")
    let merchantsCreated = 0
    let merchantsSkipped = 0

    for (const merchantData of commonMerchants) {
      try {
        const existing = await merchantModel.findByName(merchantData.merchantName)
        if (!existing) {
          await merchantModel.create({
            ...merchantData,
            source: "import",
            confidence: 95,
          })
          merchantsCreated++
        } else {
          merchantsSkipped++
        }
      } catch (error) {
        console.error(`Error creating merchant ${merchantData.merchantName}:`, error)
        merchantsSkipped++
      }
    }

    console.log(`✅ Merchants: ${merchantsCreated} created, ${merchantsSkipped} skipped`)

    // Get statistics
    const merchantStats = await merchantModel.getStatistics()
    console.log("📊 Final merchant statistics:", merchantStats)

    console.log("🎉 Database seeding completed successfully!")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    process.exit(1)
  }
}

// Run the seeding
seedDatabase()
