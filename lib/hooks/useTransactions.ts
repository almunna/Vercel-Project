"use client"

import { useState, useEffect } from "react"

interface Transaction {
  _id: string
  description: string
  amount: number
  date: string
  category: string
  isBusinessExpense: boolean
  deductionAmount: number
  source: string
  account?: string
  accountNumber?: string
  balance?: number
  notes?: string
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = async (
    options: {
      limit?: number
      skip?: number
      category?: string
      source?: string
      isBusinessExpense?: boolean
    } = {},
  ) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (options.limit) params.append("limit", options.limit.toString())
      if (options.skip) params.append("skip", options.skip.toString())
      if (options.category) params.append("category", options.category)
      if (options.source) params.append("source", options.source)
      if (options.isBusinessExpense !== undefined)
        params.append("isBusinessExpense", options.isBusinessExpense.toString())

      const response = await fetch(`/api/transactions?${params.toString()}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch transactions")
      }

      const data = await response.json()
      if (data.success) {
        setTransactions(data.transactions)
        setError(null)
      } else {
        throw new Error(data.error || "Failed to fetch transactions")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      console.error("Error fetching transactions:", err)
    } finally {
      setLoading(false)
    }
  }

  const createTransaction = async (transactionData: {
    description: string
    amount: number
    date: string
    category?: string
    isBusinessExpense?: boolean
    notes?: string
  }) => {
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to create transaction")
      }

      const data = await response.json()
      if (data.success) {
        // Refresh transactions list
        await fetchTransactions()
        return data.transaction
      } else {
        throw new Error(data.error || "Failed to create transaction")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      throw err
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    createTransaction,
    refetch: fetchTransactions,
  }
}
