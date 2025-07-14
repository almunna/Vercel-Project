import { type NextRequest, NextResponse } from "next/server"
import { getAuthToken } from "../../../auth/token/route"

const BASIQ_BASE_URL = process.env.BASIQ_BASE_URL || "https://au-api.basiq.io"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params
    const { searchParams } = new URL(request.url)
    const accountsParam = searchParams.get("accounts")
    const enrich = searchParams.get("enrich") === "true"

    console.log("Fetching transactions for user:", userId)
    console.log("Accounts filter:", accountsParam)
    console.log("Enrich:", enrich)

    // Get auth token
    const token = await getAuthToken()
    console.log("Using token:", token.substring(0, 20) + "...")

    // Fetch transactions using the exact format from documentation
    const response = await fetch(`${BASIQ_BASE_URL}/users/${userId}/transactions`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
        "basiq-version": "3.0",
      },
    })

    console.log("Transactions response status:", response.status)
    console.log("Transactions response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Get transactions failed:", errorText)
      throw new Error(`Get transactions failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("Transactions data structure:", {
      hasData: !!data.data,
      dataLength: data.data?.length || 0,
      totalCount: data.count || 0,
      sampleTransaction: data.data?.[0] || null,
    })

    // Handle the response structure properly
    let transactions = []
    if (data.data && Array.isArray(data.data)) {
      transactions = data.data
    } else if (Array.isArray(data)) {
      transactions = data
    } else {
      console.warn("Unexpected transaction data structure:", data)
      transactions = []
    }

    // Filter by accounts if specified
    if (accountsParam) {
      const accountIds = accountsParam.split(",")
      transactions = transactions.filter((txn: any) => accountIds.includes(txn.account))
      console.log(`Filtered to ${transactions.length} transactions for accounts:`, accountIds)
    }

    // Transform and enrich transactions
    const transformedTransactions = transactions.map((transaction: any) => {
      const amount = Number.parseFloat(transaction.amount || "0")
      const isDebit = amount < 0

      // Basic enrichment logic
      const description = transaction.description || transaction.reference || "Unknown Transaction"
      const category = transaction.category?.title || transaction.class || "Other"

      // Simple deduction detection based on common business expense patterns
      const businessKeywords = [
        "office",
        "supplies",
        "equipment",
        "software",
        "subscription",
        "fuel",
        "parking",
        "travel",
        "hotel",
        "restaurant",
        "meeting",
        "conference",
        "training",
        "professional",
        "legal",
        "accounting",
        "consulting",
        "marketing",
        "advertising",
        "internet",
        "phone",
      ]

      const potentialDeduction =
        isDebit &&
        businessKeywords.some(
          (keyword) => description.toLowerCase().includes(keyword) || category.toLowerCase().includes(keyword),
        )

      return {
        id: transaction.id,
        description,
        amount: Math.abs(amount),
        postDate: transaction.postDate || transaction.transactionDate || new Date().toISOString().split("T")[0],
        account: transaction.account,
        category,
        subCategory: transaction.subCategory?.title,
        class: transaction.class,
        division: transaction.division,
        group: transaction.group,
        anzsicCode: transaction.anzsicCode,
        anzsicDescription: transaction.anzsicDescription,
        deductible: potentialDeduction,
        enriched: !!transaction.anzsicCode || enrich,
      }
    })

    // Calculate summary stats
    const deductibleTransactions = transformedTransactions.filter((t: any) => t.deductible)
    const totalDeductible = deductibleTransactions.reduce((sum: number, t: any) => sum + t.amount, 0)

    const result = {
      transactions: transformedTransactions,
      totalCount: transformedTransactions.length,
      deductibleCount: deductibleTransactions.length,
      totalDeductible: Math.round(totalDeductible * 100) / 100,
    }

    console.log("Returning transaction summary:", {
      totalCount: result.totalCount,
      deductibleCount: result.deductibleCount,
      totalDeductible: result.totalDeductible,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error getting transactions:", error)
    return NextResponse.json(
      {
        error: "Failed to get transactions",
        details: error instanceof Error ? error.message : "Unknown error",
        transactions: [],
        totalCount: 0,
        deductibleCount: 0,
        totalDeductible: 0,
      },
      { status: 500 },
    )
  }
}
