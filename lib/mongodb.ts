import { MongoClient, type Db } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  console.log("🔌 Attempting to connect to MongoDB...")

  try {
    const client = await clientPromise
    console.log("✅ MongoDB client connected")

    const db = client.db("taxapp")
    console.log("✅ Database 'taxapp' selected")

    return { client, db }
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error)
    throw error
  }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise

// Add the missing getDatabase export
export async function getDatabase(): Promise<Db> {
  const { db } = await connectToDatabase()
  return db
}
