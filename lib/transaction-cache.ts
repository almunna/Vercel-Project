interface CachedTransactionData {
  transactions: any[]
  timestamp: number
  userId: string
  accounts: string[]
  userProfile?: any
}

interface CachedAccountData {
  accounts: any[]
  timestamp: number
  userId: string
}

class TransactionCache {
  private transactionCache = new Map<string, CachedTransactionData>()
  private accountCache = new Map<string, CachedAccountData>()
  private readonly CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

  private getTransactionCacheKey(userId: string, accounts: string[]): string {
    return `${userId}-${accounts.sort().join(",")}`
  }

  private getAccountCacheKey(userId: string): string {
    return `${userId}-accounts`
  }

  // Transaction Cache Methods
  setTransactions(userId: string, accounts: string[], transactions: any[], userProfile?: any): void {
    const key = this.getTransactionCacheKey(userId, accounts)
    this.transactionCache.set(key, {
      transactions,
      timestamp: Date.now(),
      userId,
      accounts,
      userProfile,
    })
    console.log(`Cached ${transactions.length} transactions for key: ${key}`)
  }

  getTransactions(userId: string, accounts: string[]): any[] | null {
    const key = this.getTransactionCacheKey(userId, accounts)
    const cached = this.transactionCache.get(key)

    if (!cached) {
      console.log(`No transaction cache found for key: ${key}`)
      return null
    }

    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION
    if (isExpired) {
      console.log(`Transaction cache expired for key: ${key}`)
      this.transactionCache.delete(key)
      return null
    }

    console.log(`Transaction cache hit for key: ${key} (${cached.transactions.length} transactions)`)
    return cached.transactions
  }

  isTransactionsFromCache(userId: string, accounts: string[]): boolean {
    const key = this.getTransactionCacheKey(userId, accounts)
    const cached = this.transactionCache.get(key)
    return cached !== undefined && Date.now() - cached.timestamp <= this.CACHE_DURATION
  }

  // Account Cache Methods
  setAccounts(userId: string, accounts: any[]): void {
    const key = this.getAccountCacheKey(userId)
    this.accountCache.set(key, {
      accounts,
      timestamp: Date.now(),
      userId,
    })
    console.log(`Cached ${accounts.length} accounts for user: ${userId}`)
  }

  getAccounts(userId: string): any[] | null {
    const key = this.getAccountCacheKey(userId)
    const cached = this.accountCache.get(key)

    if (!cached) {
      console.log(`No account cache found for user: ${userId}`)
      return null
    }

    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION
    if (isExpired) {
      console.log(`Account cache expired for user: ${userId}`)
      this.accountCache.delete(key)
      return null
    }

    console.log(`Account cache hit for user: ${userId} (${cached.accounts.length} accounts)`)
    return cached.accounts
  }

  isAccountsFromCache(userId: string): boolean {
    const key = this.getAccountCacheKey(userId)
    const cached = this.accountCache.get(key)
    return cached !== undefined && Date.now() - cached.timestamp <= this.CACHE_DURATION
  }

  // Clear Cache Methods
  clearTransactions(userId?: string): void {
    if (userId) {
      // Clear all transaction cache entries for a specific user
      for (const [key, value] of this.transactionCache.entries()) {
        if (value.userId === userId) {
          this.transactionCache.delete(key)
        }
      }
      console.log(`Cleared transaction cache for user: ${userId}`)
    } else {
      // Clear all transaction cache
      this.transactionCache.clear()
      console.log("Cleared all transaction cache")
    }
  }

  clearAccounts(userId?: string): void {
    if (userId) {
      const key = this.getAccountCacheKey(userId)
      this.accountCache.delete(key)
      console.log(`Cleared account cache for user: ${userId}`)
    } else {
      this.accountCache.clear()
      console.log("Cleared all account cache")
    }
  }

  clearAll(userId?: string): void {
    this.clearTransactions(userId)
    this.clearAccounts(userId)
  }

  // Stats Methods
  getStats(): {
    transactionEntries: number
    totalTransactions: number
    accountEntries: number
    totalAccounts: number
  } {
    let totalTransactions = 0
    for (const cached of this.transactionCache.values()) {
      totalTransactions += cached.transactions.length
    }

    let totalAccounts = 0
    for (const cached of this.accountCache.values()) {
      totalAccounts += cached.accounts.length
    }

    return {
      transactionEntries: this.transactionCache.size,
      totalTransactions,
      accountEntries: this.accountCache.size,
      totalAccounts,
    }
  }

  // Check if we have fresh data for a user
  hasFreshData(userId: string, accounts: string[]): boolean {
    return this.isTransactionsFromCache(userId, accounts) && this.isAccountsFromCache(userId)
  }
}

// Export singleton instance
export const transactionCache = new TransactionCache()
