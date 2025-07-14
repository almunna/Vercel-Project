import { merchantModel } from "../lib/models/merchant"
import { anzsicMappingModel } from "../lib/models/anzsic-mapping"

// Static ANZSIC mappings
const anzsicMappings = [
  {
    anzsicCode: "4613",
    anzsicDescription: "Motor vehicle fuel retailing",
    atoCategory: "Vehicles, Travel & Transport",
    isDeductible: true,
  },
  {
    anzsicCode: "4711",
    anzsicDescription: "Supermarket and grocery stores",
    atoCategory: "Meals & Entertainment (Work-Related)",
    isDeductible: false,
  },
  {
    anzsicCode: "5621",
    anzsicDescription: "Takeaway food services",
    atoCategory: "Meals & Entertainment (Work-Related)",
    isDeductible: true,
  },
  {
    anzsicCode: "4521",
    anzsicDescription: "Hardware and building supplies retailing",
    atoCategory: "Work Tools, Equipment & Technology",
    isDeductible: true,
  },
  {
    anzsicCode: "4252",
    anzsicDescription: "Electrical, electronic and gas appliance retailing",
    atoCategory: "Work Tools, Equipment & Technology",
    isDeductible: true,
  },
  {
    anzsicCode: "6920",
    anzsicDescription: "Accounting services",
    atoCategory: "Tax & Accounting Expenses",
    isDeductible: true,
  },
  {
    anzsicCode: "6910",
    anzsicDescription: "Legal services",
    atoCategory: "Professional Memberships & Fees",
    isDeductible: true,
  },
  {
    anzsicCode: "9999",
    anzsicDescription: "Unknown/Other",
    atoCategory: "Other",
    isDeductible: false,
  },
]

// Simple merchant seed data
const merchants = [
  { merchantName: "coles", anzsicCode: "4711" },
  { merchantName: "woolworths", anzsicCode: "4711" },
  { merchantName: "shell", anzsicCode: "4613" },
  { merchantName: "bp", anzsicCode: "4613" },
  { merchantName: "caltex", anzsicCode: "4613" },
  { merchantName: "mcdonald", anzsicCode: "5621" },
  { merchantName: "kfc", anzsicCode: "5621" },
  { merchantName: "bunnings", anzsicCode: "4521" },
  { merchantName: "uber", anzsicCode: "4613" },
]

async function seedSimpleData() {
  try {
    console.log("🌱 Seeding simple data...")

    // Seed ANZSIC mappings
    console.log("📋 Seeding ANZSIC mappings...")
    const mappingResult = await anzsicMappingModel.bulkCreate(anzsicMappings)
    console.log(`✅ ANZSIC mappings: ${mappingResult.created} created, ${mappingResult.skipped} skipped`)

    // Seed merchants
    console.log("🏪 Seeding merchants...")
    let merchantsCreated = 0
    let merchantsSkipped = 0

    for (const merchantData of merchants) {
      try {
        const existing = await merchantModel.findByName(merchantData.merchantName)
        if (!existing) {
          await merchantModel.create(merchantData)
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
    console.log("🎉 Simple seeding completed!")
  } catch (error) {
    console.error("❌ Error seeding data:", error)
    process.exit(1)
  }
}

// Run the seeding
seedSimpleData()
