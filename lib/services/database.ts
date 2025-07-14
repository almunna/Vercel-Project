import { getDatabase } from "../mongodb"
import type { Transaction, UserAccount, PDFStatement } from "../models/user"
import { ObjectId } from "mongodb"

export class DatabaseService {
  private static instance: DatabaseService

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  // Transaction operations
  async createTransaction(transactionData: Omit<Transaction, "_id" | "createdAt" | "updatedAt">): Promise<Transaction> {
    const db = await getDatabase()
    const now = new Date()

    const transaction: Transaction = {
      ...transactionData,
      userId: new ObjectId(transactionData.userId),
      createdAt: now,
      updatedAt: now,
    }

    const result = await db.collection<Transaction>("transactions").insertOne(transaction)
    return { ...transaction, _id: result.insertedId }
  }

  async createManyTransactions(transactions: Omit<Transaction, "_id" | "createdAt" | "updatedAt">[]): Promise<void> {
    if (transactions.length === 0) return

    const db = await getDatabase()
    const now = new Date()

    const transactionsWithTimestamps = transactions.map((t) => ({
      ...t,
      userId: new ObjectId(t.userId),
      createdAt: now,
      updatedAt: now,
    }))

    await db.collection<Transaction>("transactions").insertMany(transactionsWithTimestamps)
  }

  async getUserTransactions(
    userId: string,
    options: {
      accountIds?: string[]
      startDate?: Date
      endDate?: Date
      limit?: number
      skip?: number
      source?: string
      category?: string
      isBusinessExpense?: boolean
    } = {},
  ): Promise<Transaction[]> {
    const db = await getDatabase()

    const filter: any = { userId: new ObjectId(userId) }

    if (options.accountIds?.length) {
      filter.accountId = { $in: options.accountIds.map((id) => new ObjectId(id)) }
    }

    if (options.startDate || options.endDate) {
      filter.date = {}
      if (options.startDate) filter.date.$gte = options.startDate.toISOString().split("T")[0]
      if (options.endDate) filter.date.$lte = options.endDate.toISOString().split("T")[0]
    }

    if (options.source) {
      filter.source = options.source
    }

    if (options.category) {
      filter.category = options.category
    }

    if (options.isBusinessExpense !== undefined) {
      filter.isBusinessExpense = options.isBusinessExpense
    }

    let query = db.collection<Transaction>("transactions").find(filter)

    if (options.skip) query = query.skip(options.skip)
    if (options.limit) query = query.limit(options.limit)

    return await query.sort({ date: -1 }).toArray()
  }

  async updateTransaction(transactionId: string, updates: Partial<Transaction>): Promise<void> {
    const db = await getDatabase()
    await db.collection<Transaction>("transactions").updateOne(
      { _id: new ObjectId(transactionId) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
    )
  }

  async deleteTransaction(transactionId: string): Promise<void> {
    const db = await getDatabase()
    await db.collection<Transaction>("transactions").deleteOne({ _id: new ObjectId(transactionId) })
  }

  async deleteUserTransactions(userId: string, source?: string): Promise<void> {
    const db = await getDatabase()
    const filter: any = { userId: new ObjectId(userId) }
    if (source) {
      filter.source = source
    }
    await db.collection<Transaction>("transactions").deleteMany(filter)
  }

  // Account operations
  async createAccount(accountData: Omit<UserAccount, "_id" | "createdAt" | "updatedAt">): Promise<UserAccount> {
    const db = await getDatabase()
    const now = new Date()

    const account: UserAccount = {
      ...accountData,
      userId: new ObjectId(accountData.userId),
      createdAt: now,
      updatedAt: now,
    }

    const result = await db.collection<UserAccount>("accounts").insertOne(account)
    return { ...account, _id: result.insertedId }
  }

  async getUserAccounts(userId: string): Promise<UserAccount[]> {
    const db = await getDatabase()
    return await db
      .collection<UserAccount>("accounts")
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray()
  }

  async updateAccount(accountId: string, updates: Partial<UserAccount>): Promise<void> {
    const db = await getDatabase()
    await db.collection<UserAccount>("accounts").updateOne(
      { _id: new ObjectId(accountId) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
    )
  }

  // PDF Statement operations
  async createPDFStatement(statementData: Omit<PDFStatement, "_id">): Promise<PDFStatement> {
    const db = await getDatabase()
    const result = await db.collection<PDFStatement>("pdf_statements").insertOne({
      ...statementData,
      userId: new ObjectId(statementData.userId),
    })
    return { ...statementData, _id: result.insertedId }
  }

  async getUserPDFStatements(userId: string): Promise<PDFStatement[]> {
    const db = await getDatabase()
    return await db
      .collection<PDFStatement>("pdf_statements")
      .find({ userId: new ObjectId(userId) })
      .sort({ uploadedAt: -1 })
      .toArray()
  }

  async updatePDFStatement(statementId: string, updates: Partial<PDFStatement>): Promise<void> {
    const db = await getDatabase()
    await db.collection<PDFStatement>("pdf_statements").updateOne({ _id: new ObjectId(statementId) }, { $set: updates })
  }

  // Analytics and aggregation
  async getUserStats(userId: string): Promise<{
    totalTransactions: number
    totalIncome: number
    totalExpenses: number
    totalDeductions: number
    accountsConnected: number
  }> {
    const db = await getDatabase()

    const [transactionStats, accountCount] = await Promise.all([
      db
        .collection<Transaction>("transactions")
        .aggregate([
          { $match: { userId: new ObjectId(userId) } },
          {
            $group: {
              _id: null,
              totalTransactions: { $sum: 1 },
              totalIncome: {
                $sum: {
                  $cond: [{ $gt: ["$amount", 0] }, "$amount", 0],
                },
              },
              totalExpenses: {
                $sum: {
                  $cond: [{ $lt: ["$amount", 0] }, { $abs: "$amount" }, 0],
                },
              },
              totalDeductions: {
                $sum: {
                  $cond: ["$isBusinessExpense", "$deductionAmount", 0],
                },
              },
            },
          },
        ])
        .toArray(),
      db.collection<UserAccount>("accounts").countDocuments({ userId: new ObjectId(userId), isActive: true }),
    ])

    const stats = transactionStats[0] || {
      totalTransactions: 0,
      totalIncome: 0,
      totalExpenses: 0,
      totalDeductions: 0,
    }

    return {
      ...stats,
      accountsConnected: accountCount,
    }
  }

  async getMonthlyTrends(userId: string, months = 6): Promise<any[]> {
    const db = await getDatabase()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    return await db
      .collection<Transaction>("transactions")
      .aggregate([
        {
          $match: {
            userId: new ObjectId(userId),
            date: { $gte: startDate.toISOString().split("T")[0] },
          },
        },
        {
          $addFields: {
            dateObj: { $dateFromString: { dateString: "$date" } },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$dateObj" },
              month: { $month: "$dateObj" },
            },
            expenses: {
              $sum: {
                $cond: [{ $lt: ["$amount", 0] }, { $abs: "$amount" }, 0],
              },
            },
            deductions: {
              $sum: {
                $cond: ["$isBusinessExpense", "$deductionAmount", 0],
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ])
      .toArray()
  }

  async getCategoryBreakdown(userId: string): Promise<any[]> {
    const db = await getDatabase()

    return await db
      .collection<Transaction>("transactions")
      .aggregate([
        {
          $match: {
            userId: new ObjectId(userId),
            isBusinessExpense: true,
          },
        },
        {
          $group: {
            _id: "$category",
            amount: { $sum: "$deductionAmount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { amount: -1 } },
      ])
      .toArray()
  }
}
