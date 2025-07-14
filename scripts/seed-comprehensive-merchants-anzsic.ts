import { merchantModel } from "@/lib/models/merchant"
import { anzsicMappingModel } from "@/lib/models/anzsic-mapping"

// Comprehensive ANZSIC mappings for all 11 deduction categories
const COMPREHENSIVE_ANZSIC_MAPPINGS = [
  // 1. Vehicles, Travel & Transport
  {
    anzsicCode: "4613",
    anzsicDescription: "Motor Vehicle Fuel Retailing",
    atoCategory: "Vehicles, Travel & Transport",
    isDeductible: true,
    confidenceLevel: 95,
    source: "comprehensive-seed" as const,
    examples: ["Shell", "BP", "Caltex", "Mobil", "Ampol", "7-Eleven fuel"],
  },
  {
    anzsicCode: "4622",
    anzsicDescription: "Taxi and Other Road Passenger Transport",
    atoCategory: "Vehicles, Travel & Transport",
    isDeductible: true,
    confidenceLevel: 95,
    source: "comprehensive-seed" as const,
    examples: ["Uber", "Taxi", "Rideshare", "Cabcharge"],
  },
  {
    anzsicCode: "4821",
    anzsicDescription: "Rail Passenger Transport",
    atoCategory: "Vehicles, Travel & Transport",
    isDeductible: true,
    confidenceLevel: 90,
    source: "comprehensive-seed" as const,
    examples: ["Train tickets", "Metro", "Rail transport"],
  },
  {
    anzsicCode: "4832",
    anzsicDescription: "Water Passenger Transport",
    atoCategory: "Vehicles, Travel & Transport",
    isDeductible: true,
    confidenceLevel: 85,
    source: "comprehensive-seed" as const,
    examples: ["Ferry", "Water taxi", "Boat transport"],
  },
  {
    anzsicCode: "4900",
    anzsicDescription: "Air and Space Transport",
    atoCategory: "Vehicles, Travel & Transport",
    isDeductible: true,
    confidenceLevel: 95,
    source: "comprehensive-seed" as const,
    examples: ["Jetstar", "Qantas", "Virgin", "Flight tickets"],
  },

  // 2. Work Tools, Equipment & Technology
  {
    anzsicCode: "4231",
    anzsicDescription: "Hardware and Building Supplies Retailing",
    atoCategory: "Work Tools, Equipment & Technology",
    isDeductible: true,
    confidenceLevel: 85,
    source: "comprehensive-seed" as const,
    examples: ["Bunnings", "Mitre 10", "Masters", "Hardware tools"],
  },
  {
    anzsicCode: "4252",
    anzsicDescription: "Computer and Computer Peripheral Retailing",
    atoCategory: "Work Tools, Equipment & Technology",
    isDeductible: true,
    confidenceLevel: 90,
    source: "comprehensive-seed" as const,
    examples: ["JB Hi-Fi", "Harvey Norman", "Officeworks computers"],
  },
  {
    anzsicCode: "4253",
    anzsicDescription: "Telecommunication Goods Retailing",
    atoCategory: "Work Tools, Equipment & Technology",
    isDeductible: true,
    confidenceLevel: 85,
    source: "comprehensive-seed" as const,
    examples: ["Mobile phones", "Tablets", "Communication devices"],
  },
  {
    anzsicCode: "4259",
    anzsicDescription: "Other Electrical and Electronic Goods Retailing",
    atoCategory: "Work Tools, Equipment & Technology",
    isDeductible: true,
    confidenceLevel: 80,
    source: "comprehensive-seed" as const,
    examples: ["Electronics", "Work equipment", "Technical devices"],
  },

  // 3. Home Office Expenses
  {
    anzsicCode: "5910",
    anzsicDescription: "Telecommunications Services",
    atoCategory: "Home Office Expenses",
    isDeductible: true,
    confidenceLevel: 95,
    source: "comprehensive-seed" as const,
    examples: ["Telstra", "Optus", "Vodafone", "TPG", "Internet", "Mobile plans"],
  },
  {
    anzsicCode: "2610",
    anzsicDescription: "Electricity Supply",
    atoCategory: "Home Office Expenses",
    isDeductible: true,
    confidenceLevel: 75,
    source: "comprehensive-seed" as const,
    examples: ["Energy Australia", "Origin", "AGL", "Electricity bills"],
  },
  {
    anzsicCode: "2620",
    anzsicDescription: "Gas Supply",
    atoCategory: "Home Office Expenses",
    isDeductible: true,
    confidenceLevel: 75,
    source: "comprehensive-seed" as const,
    examples: ["Gas bills", "Natural gas", "LPG"],
  },
  {
    anzsicCode: "2800",
    anzsicDescription: "Water Supply, Sewerage and Drainage Services",
    atoCategory: "Home Office Expenses",
    isDeductible: true,
    confidenceLevel: 70,
    source: "comprehensive-seed" as const,
    examples: ["Water bills", "Council rates", "Utilities"],
  },

  // 4. Professional Memberships & Fees
  {
    anzsicCode: "6920",
    anzsicDescription: "Accounting Services",
    atoCategory: "Professional Memberships & Fees",
    isDeductible: true,
    confidenceLevel: 95,
    source: "comprehensive-seed" as const,
    examples: ["Accountant", "Tax agent", "Bookkeeper", "CPA"],
  },
  {
    anzsicCode: "6931",
    anzsicDescription: "Legal Services",
    atoCategory: "Professional Memberships & Fees",
    isDeductible: true,
    confidenceLevel: 90,
    source: "comprehensive-seed" as const,
    examples: ["Lawyer", "Solicitor", "Legal advice", "Law firm"],
  },
  {
    anzsicCode: "6962",
    anzsicDescription: "Management Advice and Related Consulting Services",
    atoCategory: "Professional Memberships & Fees",
    isDeductible: true,
    confidenceLevel: 85,
    source: "comprehensive-seed" as const,
    examples: ["Consultant", "Business advisor", "Management consulting"],
  },
  {
    anzsicCode: "8552",
    anzsicDescription: "Technical and Vocational Education and Training",
    atoCategory: "Professional Memberships & Fees",
    isDeductible: true,
    confidenceLevel: 90,
    source: "comprehensive-seed" as const,
    examples: ["TAFE", "Training courses", "Professional development"],
  },

  // 5. Tax & Accounting Expenses
  {
    anzsicCode: "6221",
    anzsicDescription: "Banks",
    atoCategory: "Tax & Accounting Expenses",
    isDeductible: true,
    confidenceLevel: 85,
    source: "comprehensive-seed" as const,
    examples: ["Bank fees", "Account fees", "Transaction fees", "ATM fees"],
  },
  {
    anzsicCode: "6222",
    anzsicDescription: "Other Depository Corporations",
    atoCategory: "Tax & Accounting Expenses",
    isDeductible: true,
    confidenceLevel: 80,
    source: "comprehensive-seed" as const,
    examples: ["Credit union fees", "Building society fees"],
  },
  {
    anzsicCode: "6321",
    anzsicDescription: "Life Insurance",
    atoCategory: "Tax & Accounting Expenses",
    isDeductible: true,
    confidenceLevel: 75,
    source: "comprehensive-seed" as const,
    examples: ["Income protection", "Life insurance premiums"],
  },

  // 6. Meals & Entertainment (Work-Related)
  {
    anzsicCode: "5611",
    anzsicDescription: "Takeaway Food Services",
    atoCategory: "Meals & Entertainment (Work-Related)",
    isDeductible: true,
    confidenceLevel: 70,
    source: "comprehensive-seed" as const,
    examples: ["McDonald's", "KFC", "Subway", "Domino's", "Pizza Hut"],
  },
  {
    anzsicCode: "5613",
    anzsicDescription: "Cafes and Restaurants",
    atoCategory: "Meals & Entertainment (Work-Related)",
    isDeductible: true,
    confidenceLevel: 65,
    source: "comprehensive-seed" as const,
    examples: ["Starbucks", "Gloria Jeans", "Coffee Club", "Restaurants"],
  },
  {
    anzsicCode: "5614",
    anzsicDescription: "Pubs, Taverns and Bars",
    atoCategory: "Meals & Entertainment (Work-Related)",
    isDeductible: true,
    confidenceLevel: 60,
    source: "comprehensive-seed" as const,
    examples: ["Business meals", "Client entertainment", "Work functions"],
  },

  // 7. Clothing & Uniforms (Work-Related)
  {
    anzsicCode: "4251",
    anzsicDescription: "Clothing Retailing",
    atoCategory: "Clothing & Uniforms (Work-Related)",
    isDeductible: true,
    confidenceLevel: 50,
    source: "comprehensive-seed" as const,
    examples: ["Work uniforms", "Safety clothing", "Protective gear"],
  },
  {
    anzsicCode: "4252",
    anzsicDescription: "Footwear Retailing",
    atoCategory: "Clothing & Uniforms (Work-Related)",
    isDeductible: true,
    confidenceLevel: 50,
    source: "comprehensive-seed" as const,
    examples: ["Safety boots", "Work shoes", "Protective footwear"],
  },

  // 8. Education & Training
  {
    anzsicCode: "8102",
    anzsicDescription: "Higher Education",
    atoCategory: "Education & Training",
    isDeductible: true,
    confidenceLevel: 90,
    source: "comprehensive-seed" as const,
    examples: ["University fees", "Course fees", "Study materials"],
  },
  {
    anzsicCode: "8551",
    anzsicDescription: "Sports and Physical Recreation Instruction",
    atoCategory: "Education & Training",
    isDeductible: true,
    confidenceLevel: 70,
    source: "comprehensive-seed" as const,
    examples: ["Professional training", "Skills development"],
  },

  // 9. Insurance (Work-Related)
  {
    anzsicCode: "6322",
    anzsicDescription: "General Insurance",
    atoCategory: "Insurance (Work-Related)",
    isDeductible: true,
    confidenceLevel: 80,
    source: "comprehensive-seed" as const,
    examples: ["Professional indemnity", "Public liability", "Work insurance"],
  },
  {
    anzsicCode: "6323",
    anzsicDescription: "Health Insurance",
    atoCategory: "Insurance (Work-Related)",
    isDeductible: true,
    confidenceLevel: 75,
    source: "comprehensive-seed" as const,
    examples: ["Income protection", "Health insurance premiums"],
  },

  // 10. Subscriptions & Memberships (Work-Related)
  {
    anzsicCode: "5813",
    anzsicDescription: "Book Publishing",
    atoCategory: "Subscriptions & Memberships (Work-Related)",
    isDeductible: true,
    confidenceLevel: 80,
    source: "comprehensive-seed" as const,
    examples: ["Professional journals", "Industry publications"],
  },
  {
    anzsicCode: "9139",
    anzsicCode: "9139",
    anzsicDescription: "Other Interest Group Services",
    atoCategory: "Subscriptions & Memberships (Work-Related)",
    isDeductible: true,
    confidenceLevel: 85,
    source: "comprehensive-seed" as const,
    examples: ["Professional associations", "Industry memberships"],
  },

  // 11. Other Work-Related Expenses
  {
    anzsicCode: "7291",
    anzsicDescription: "Office Administrative Services",
    atoCategory: "Other Work-Related Expenses",
    isDeductible: true,
    confidenceLevel: 80,
    source: "comprehensive-seed" as const,
    examples: ["Office supplies", "Administrative services"],
  },
  {
    anzsicCode: "4239",
    anzsicDescription: "Other Store-Based Retailing n.e.c.",
    atoCategory: "Other Work-Related Expenses",
    isDeductible: true,
    confidenceLevel: 60,
    source: "comprehensive-seed" as const,
    examples: ["Work supplies", "Miscellaneous work items"],
  },

  // Non-deductible categories
  {
    anzsicCode: "4110",
    anzsicDescription: "Supermarket and Grocery Stores",
    atoCategory: "Personal Expenses",
    isDeductible: false,
    confidenceLevel: 95,
    source: "comprehensive-seed" as const,
    examples: ["Woolworths", "Coles", "ALDI", "IGA", "Groceries"],
  },
  {
    anzsicCode: "4251",
    anzsicDescription: "Clothing Retailing (Personal)",
    atoCategory: "Personal Expenses",
    isDeductible: false,
    confidenceLevel: 90,
    source: "comprehensive-seed" as const,
    examples: ["Target", "Kmart", "Big W", "Myer", "Personal clothing"],
  },
]

// Comprehensive merchant database with proper ANZSIC mappings
const COMPREHENSIVE_MERCHANTS = [
  // Fuel & Transport (Deductible)
  {
    merchantName: "shell",
    displayName: "Shell",
    anzsicCode: "4613",
    keywords: ["shell", "shell coles express", "shell service station"],
    aliases: ["shell australia", "shell energy"],
    source: "comprehensive-seed" as const,
    confidence: 95,
  },
  {
    merchantName: "bp",
    displayName: "BP",
    anzsicCode: "4613",
    keywords: ["bp", "bp service station", "bp fuel"],
    aliases: ["british petroleum", "bp australia"],
    source: "comprehensive-seed" as const,
    confidence: 95,
  },
  {
    merchantName: "caltex",
    displayName: "Caltex",
    anzsicCode: "4613",
    keywords: ["caltex", "caltex woolworths", "caltex service station"],
    aliases: ["caltex australia", "ampol"],
    source: "comprehensive-seed" as const,
    confidence: 95,
  },
  {
    merchantName: "mobil",
    displayName: "Mobil",
    anzsicCode: "4613",
    keywords: ["mobil", "mobil service station", "mobil fuel"],
    aliases: ["exxonmobil", "mobil australia"],
    source: "comprehensive-seed" as const,
    confidence: 95,
  },
  {
    merchantName: "7-eleven",
    displayName: "7-Eleven",
    anzsicCode: "4613",
    keywords: ["7-eleven", "7eleven", "seven eleven"],
    aliases: ["7-11", "seven-eleven"],
    source: "comprehensive-seed" as const,
    confidence: 90,
  },
  {
    merchantName: "uber",
    displayName: "Uber",
    anzsicCode: "4622",
    keywords: ["uber", "uber trip", "uber ride"],
    aliases: ["uber technologies", "uber australia"],
    source: "comprehensive-seed" as const,
    confidence: 95,
  },
  {
    merchantName: "taxi",
    displayName: "Taxi Service",
    anzsicCode: "4622",
    keywords: ["taxi", "cab", "cabcharge"],
    aliases: ["taxi cab", "yellow cab"],
    source: "comprehensive-seed" as const,
    confidence: 90,
  },

  // Hardware & Tools (Deductible)
  {
    merchantName: "bunnings",
    displayName: "Bunnings Warehouse",
    anzsicCode: "4231",
    keywords: ["bunnings", "bunnings warehouse", "bunnings trade"],
    aliases: ["bunnings group", "bunnings australia"],
    source: "comprehensive-seed" as const,
    confidence: 90,
  },
  {
    merchantName: "mitre 10",
    displayName: "Mitre 10",
    anzsicCode: "4231",
    keywords: ["mitre 10", "mitre10", "mitre ten"],
    aliases: ["mitre 10 australia"],
    source: "comprehensive-seed" as const,
    confidence: 85,
  },
  {
    merchantName: "masters",
    displayName: "Masters Home Improvement",
    anzsicCode: "4231",
    keywords: ["masters", "masters home improvement"],
    aliases: ["masters hardware"],
    source: "comprehensive-seed" as const,
    confidence: 80,
  },

  // Electronics & Technology (Deductible)
  {
    merchantName: "jb hi-fi",
    displayName: "JB Hi-Fi",
    anzsicCode: "4252",
    keywords: ["jb hi-fi", "jb hifi", "jbhifi"],
    aliases: ["jb hi fi", "jb electronics"],
    source: "comprehensive-seed" as const,
    confidence: 85,
  },
  {
    merchantName: "harvey norman",
    displayName: "Harvey Norman",
    anzsicCode: "4252",
    keywords: ["harvey norman", "harvey norman computers"],
    aliases: ["harvey norman electronics"],
    source: "comprehensive-seed" as const,
    confidence: 85,
  },
  {
    merchantName: "officeworks",
    displayName: "Officeworks",
    anzsicCode: "4252",
    keywords: ["officeworks", "office works"],
    aliases: ["officeworks australia"],
    source: "comprehensive-seed" as const,
    confidence: 90,
  },

  // Telecommunications (Deductible)
  {
    merchantName: "telstra",
    displayName: "Telstra",
    anzsicCode: "5910",
    keywords: ["telstra", "telstra mobile", "telstra internet"],
    aliases: ["telstra corporation"],
    source: "comprehensive-seed" as const,
    confidence: 95,
  },
  {
    merchantName: "optus",
    displayName: "Optus",
    anzsicCode: "5910",
    keywords: ["optus", "optus mobile", "optus internet"],
    aliases: ["singtel optus"],
    source: "comprehensive-seed" as const,
    confidence: 95,
  },
  {
    merchantName: "vodafone",
    displayName: "Vodafone",
    anzsicCode: "5910",
    keywords: ["vodafone", "vodafone mobile", "vodafone australia"],
    aliases: ["vha", "vodafone hutchison"],
    source: "comprehensive-seed" as const,
    confidence: 95,
  },
  {
    merchantName: "tpg",
    displayName: "TPG",
    anzsicCode: "5910",
    keywords: ["tpg", "tpg internet", "tpg telecom"],
    aliases: ["tpg communications"],
    source: "comprehensive-seed" as const,
    confidence: 90,
  },

  // Professional Services (Deductible)
  {
    merchantName: "accountant",
    displayName: "Accounting Services",
    anzsicCode: "6920",
    keywords: ["accountant", "accounting", "tax agent", "bookkeeper"],
    aliases: ["cpa", "chartered accountant"],
    source: "comprehensive-seed" as const,
    confidence: 95,
  },
  {
    merchantName: "lawyer",
    displayName: "Legal Services",
    anzsicCode: "6931",
    keywords: ["lawyer", "solicitor", "legal", "law firm"],
    aliases: ["barrister", "attorney"],
    source: "comprehensive-seed" as const,
    confidence: 90,
  },

  // Banking (Deductible)
  {
    merchantName: "commonwealth bank",
    displayName: "Commonwealth Bank",
    anzsicCode: "6221",
    keywords: ["commonwealth bank", "commbank", "cba", "netbank"],
    aliases: ["commonwealth bank of australia"],
    source: "comprehensive-seed" as const,
    confidence: 90,
  },
  {
    merchantName: "westpac",
    displayName: "Westpac",
    anzsicCode: "6221",
    keywords: ["westpac", "westpac bank", "westpac banking"],
    aliases: ["westpac banking corporation"],
    source: "comprehensive-seed" as const,
    confidence: 90,
  },
  {
    merchantName: "anz",
    displayName: "ANZ Bank",
    anzsicCode: "6221",
    keywords: ["anz", "anz bank", "australia and new zealand banking"],
    aliases: ["anz banking group"],
    source: "comprehensive-seed" as const,
    confidence: 90,
  },
  {
    merchantName: "nab",
    displayName: "National Australia Bank",
    anzsicCode: "6221",
    keywords: ["nab", "national australia bank", "nab bank"],
    aliases: ["national australia bank limited"],
    source: "comprehensive-seed" as const,
    confidence: 90,
  },

  // Fast Food (Work-Related Meals - Deductible)
  {
    merchantName: "mcdonalds",
    displayName: "McDonald's",
    anzsicCode: "5611",
    keywords: ["mcdonalds", "mcdonald", "maccas", "mcd"],
    aliases: ["mcdonalds australia"],
    source: "comprehensive-seed" as const,
    confidence: 75,
  },
  {
    merchantName: "kfc",
    displayName: "KFC",
    anzsicCode: "5611",
    keywords: ["kfc", "kentucky fried chicken"],
    aliases: ["kfc australia"],
    source: "comprehensive-seed" as const,
    confidence: 75,
  },
  {
    merchantName: "subway",
    displayName: "Subway",
    anzsicCode: "5611",
    keywords: ["subway", "subway sandwiches"],
    aliases: ["subway australia"],
    source: "comprehensive-seed" as const,
    confidence: 75,
  },
  {
    merchantName: "dominos",
    displayName: "Domino's Pizza",
    anzsicCode: "5611",
    keywords: ["dominos", "domino's", "dominos pizza"],
    aliases: ["dominos australia"],
    source: "comprehensive-seed" as const,
    confidence: 75,
  },

  // Coffee Shops (Work-Related - Deductible)
  {
    merchantName: "starbucks",
    displayName: "Starbucks",
    anzsicCode: "5613",
    keywords: ["starbucks", "starbucks coffee"],
    aliases: ["starbucks australia"],
    source: "comprehensive-seed" as const,
    confidence: 70,
  },
  {
    merchantName: "gloria jeans",
    displayName: "Gloria Jean's Coffees",
    anzsicCode: "5613",
    keywords: ["gloria jeans", "gloria jean's", "gloria jeans coffee"],
    aliases: ["gloria jeans coffees"],
    source: "comprehensive-seed" as const,
    confidence: 70,
  },

  // Supermarkets (Non-Deductible)
  {
    merchantName: "woolworths",
    displayName: "Woolworths",
    anzsicCode: "4110",
    keywords: ["woolworths", "woolies", "woolworths supermarket"],
    aliases: ["woolworths group", "woolworths australia"],
    source: "comprehensive-seed" as const,
    confidence: 95,
  },
  {
    merchantName: "coles",
    displayName: "Coles",
    anzsicCode: "4110",
    keywords: ["coles", "coles supermarket", "coles group"],
    aliases: ["coles australia"],
    source: "comprehensive-seed" as const,
    confidence: 95,
  },
  {
    merchantName: "aldi",
    displayName: "ALDI",
    anzsicCode: "4110",
    keywords: ["aldi", "aldi supermarket"],
    aliases: ["aldi australia"],
    source: "comprehensive-seed" as const,
    confidence: 95,
  },
  {
    merchantName: "iga",
    displayName: "IGA",
    anzsicCode: "4110",
    keywords: ["iga", "independent grocers", "iga supermarket"],
    aliases: ["independent grocers of australia"],
    source: "comprehensive-seed" as const,
    confidence: 90,
  },

  // Retail Clothing (Non-Deductible)
  {
    merchantName: "target",
    displayName: "Target Australia",
    anzsicCode: "4251",
    keywords: ["target", "target australia"],
    aliases: ["target retail"],
    source: "comprehensive-seed" as const,
    confidence: 85,
  },
  {
    merchantName: "kmart",
    displayName: "Kmart",
    anzsicCode: "4251",
    keywords: ["kmart", "kmart australia"],
    aliases: ["kmart retail"],
    source: "comprehensive-seed" as const,
    confidence: 85,
  },
  {
    merchantName: "big w",
    displayName: "Big W",
    anzsicCode: "4251",
    keywords: ["big w", "bigw", "big w stores"],
    aliases: ["big w australia"],
    source: "comprehensive-seed" as const,
    confidence: 85,
  },
]

async function seedComprehensiveMerchantsAndAnzsic() {
  console.log("🌱 Starting comprehensive merchant and ANZSIC seeding...")

  try {
    // Create database indexes first
    console.log("📊 Creating database indexes...")
    await merchantModel.createIndexes()
    await anzsicMappingModel.createIndexes()

    // Seed ANZSIC mappings first
    console.log("🗺️ Seeding ANZSIC mappings...")
    const anzsicCount = await anzsicMappingModel.bulkCreate(COMPREHENSIVE_ANZSIC_MAPPINGS)
    console.log(`✅ Created ${anzsicCount} ANZSIC mappings`)

    // Seed merchants
    console.log("🏪 Seeding merchants...")
    const merchantCount = await merchantModel.bulkCreate(COMPREHENSIVE_MERCHANTS)
    console.log(`✅ Created ${merchantCount} merchants`)

    // Get statistics
    const merchantStats = await merchantModel.getStatistics()
    const anzsicStats = await anzsicMappingModel.getStatistics()

    console.log("\n📈 Seeding Statistics:")
    console.log(`- Total merchants: ${merchantStats.total}`)
    console.log(`- Total ANZSIC mappings: ${anzsicStats.total}`)
    console.log(`- Deductible mappings: ${anzsicStats.deductible}`)
    console.log(`- Deductible percentage: ${((anzsicStats.deductible / anzsicStats.total) * 100).toFixed(1)}%`)

    console.log("\n🎯 Top ANZSIC codes by merchant count:")
    merchantStats.byAnzsicCode.slice(0, 5).forEach((item) => {
      console.log(`  - ${item.anzsicCode}: ${item.count} merchants`)
    })

    console.log("\n✅ Comprehensive seeding completed successfully!")

    return {
      success: true,
      merchantsCreated: merchantCount,
      anzsicMappingsCreated: anzsicCount,
      totalMerchants: merchantStats.total,
      totalAnzsicMappings: anzsicStats.total,
      deductibleMappings: anzsicStats.deductible,
    }
  } catch (error) {
    console.error("❌ Seeding failed:", error)
    throw error
  }
}

// Run the seeding function
seedComprehensiveMerchantsAndAnzsic()
  .then((result) => {
    console.log("🎉 Seeding completed:", result)
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Seeding failed:", error)
    process.exit(1)
  })
