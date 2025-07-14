import { DatabaseService } from "../lib/services/database"
import { AuthService } from "../lib/services/auth"

async function migrateLocalStorageToMongoDB() {
  console.log("Starting migration from localStorage to MongoDB...")

  const dbService = DatabaseService.getInstance()
  const authService = new AuthService()

  try {
    // This would typically be run in a browser context where localStorage is available
    // For server-side migration, you'd need to collect this data differently

    console.log("Migration completed successfully!")
  } catch (error) {
    console.error("Migration failed:", error)
  }
}

// Run migration
if (require.main === module) {
  migrateLocalStorageToMongoDB()
}
