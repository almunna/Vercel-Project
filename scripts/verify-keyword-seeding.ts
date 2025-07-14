import clientPromise from "../lib/mongodb"

async function verifyKeywordSeeding() {
  try {
    console.log("🔍 Verifying keyword seeding...")

    const client = await clientPromise
    const db = client.db("taxapp")
    const collection = db.collection("keyword_mappings")

    // Check total count
    const totalCount = await collection.countDocuments()
    console.log(`📊 Total keywords in database: ${totalCount}`)

    if (totalCount === 0) {
      console.log("❌ No keywords found! Database is empty.")
      console.log("💡 Run: node scripts/seed-comprehensive-deduction-keywords.ts")
      return
    }

    // Check specific test keywords
    const testKeywords = ["uber", "coles", "fuel", "laptop", "netflix", "woolworths"]
    console.log("\n🧪 Testing specific keywords:")

    for (const keyword of testKeywords) {
      const found = await collection.findOne({ keyword: keyword.toLowerCase() })
      if (found) {
        console.log(`✅ ${keyword}: ${found.status} (${found.atoCategory || "N/A"})`)
      } else {
        console.log(`❌ ${keyword}: NOT FOUND`)
      }
    }

    // Check status distribution
    const statusStats = await collection
      .aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray()

    console.log("\n📈 Status distribution:")
    statusStats.forEach((stat) => {
      console.log(`  ${stat._id}: ${stat.count}`)
    })

    // Check ATO categories
    const categoryStats = await collection
      .aggregate([
        { $match: { status: "deductible" } },
        {
          $group: {
            _id: "$atoCategory",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ])
      .toArray()

    console.log("\n📂 ATO categories:")
    categoryStats.forEach((stat) => {
      console.log(`  ${stat._id}: ${stat.count}`)
    })

    // Test the bulk search functionality
    console.log("\n🔍 Testing bulk search with sample descriptions:")
    const testDescriptions = [
      "Debit Card Purchase Uber *trip Sydney Aus",
      "Debit Card Purchase Coles Rose Bay Aus",
      "Debit Card Purchase Netflix.com",
      "Debit Card Purchase Officeworks",
    ]

    for (const description of testDescriptions) {
      // Extract keyword (simplified version)
      const words = description
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(" ")
        .filter((word) => word.length >= 3)
        .filter((word) => !["debit", "card", "purchase", "aus", "sydney"].includes(word))

      const extractedKeyword = words[0]
      if (extractedKeyword) {
        const found = await collection.findOne({ keyword: extractedKeyword })
        console.log(
          `  "${description.substring(0, 40)}..." → "${extractedKeyword}" → ${found ? `${found.status} (${found.atoCategory || "N/A"})` : "NOT FOUND"}`,
        )
      }
    }

    console.log("\n✅ Verification complete!")
  } catch (error) {
    console.error("❌ Verification failed:", error)
  }
}

// Run verification
verifyKeywordSeeding()
  .then(() => {
    console.log("🎉 Verification finished")
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Verification error:", error)
    process.exit(1)
  })
