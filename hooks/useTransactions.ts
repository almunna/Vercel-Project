"use client"

import { useState, useEffect } from "react"
import { TransactionUtils, type Transaction } from "@/lib/transaction-utils"

interface UseTransactionsOptions {
  accountIds?: string[]
  startDate?: Date
  endDate?: Date
  category?: string
  isDeduction?: boolean
  isIncome?: boolean
  limit?: number
  offset?: number
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)

      // Use centralized transaction loading
      const allTransactions = await TransactionUtils.loadAllTransactions()

      // Apply filters if provided
      let filteredTransactions = allTransactions

      if (options.accountIds?.length) {
        filteredTransactions = filteredTransactions.filter((t) => options.accountIds!.includes(t.accountId || ""))
      }

      if (options.startDate) {
        filteredTransactions = filteredTransactions.filter((t) => new Date(t.date) >= options.startDate!)
      }

      if (options.endDate) {
        filteredTransactions = filteredTransactions.filter((t) => new Date(t.date) <= options.endDate!)
      }

      if (options.category) {
        filteredTransactions = filteredTransactions.filter((t) => t.category === options.category)
      }

      if (options.isDeduction !== undefined) {
        filteredTransactions = filteredTransactions.filter((t) => t.isBusinessExpense === options.isDeduction)
      }

      if (options.isIncome !== undefined) {
        const isIncome = options.isIncome
        filteredTransactions = filteredTransactions.filter((t) => (isIncome ? t.amount > 0 : t.amount < 0))
      }

      // Apply limit and offset
      if (options.offset) {
        filteredTransactions = filteredTransactions.slice(options.offset)
      }

      if (options.limit) {
        filteredTransactions = filteredTransactions.slice(0, options.limit)
      }

      setTransactions(filteredTransactions)
    } catch (err: any) {
      setError(err.message)
      console.error("Error fetching transactions:", err)
    } finally {
      setLoading(false)
    }
  }

  const createTransaction = async (transaction: Omit<Transaction, "id">) => {
    try {
      // For now, just add to localStorage - in a real app this would call an API
      const newTransaction: Transaction = {
        ...transaction,
        id: Date.now().toString(),
      }

      setTransactions((prev) => [newTransaction, ...prev])
      return newTransaction
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))

      // Update in localStorage if it's a PDF transaction
      const pdfTransactions = JSON.parse(localStorage.getItem("pdf_transactions") || "[]")
      const updatedPdfTransactions = pdfTransactions.map((t: any) => (t.id === id ? { ...t, ...updates } : t))
      localStorage.setItem("pdf_transactions", JSON.stringify(updatedPdfTransactions))

      return { ...transactions.find((t) => t.id === id), ...updates }
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      setTransactions((prev) => prev.filter((t) => t.id !== id))

      // Remove from localStorage if it's a PDF transaction
      const pdfTransactions = JSON.parse(localStorage.getItem("pdf_transactions") || "[]")
      const filteredPdfTransactions = pdfTransactions.filter((t: any) => t.id !== id)
      localStorage.setItem("pdf_transactions", JSON.stringify(filteredPdfTransactions))
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const refreshTransactions = async () => {
    await fetchTransactions()
  }

  useEffect(() => {
    fetchTransactions()
  }, [JSON.stringify(options)])

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
    refreshTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  }
}
