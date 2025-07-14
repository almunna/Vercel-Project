// Memory optimization utilities
export class MemoryOptimizer {
  private static memoryUsage: number[] = []
  private static readonly MAX_SAMPLES = 50

  static trackMemoryUsage(): void {
    if (typeof process !== "undefined" && process.memoryUsage) {
      const usage = process.memoryUsage()
      const totalMB = Math.round(usage.heapUsed / 1024 / 1024)

      this.memoryUsage.push(totalMB)

      // Keep only recent samples
      if (this.memoryUsage.length > this.MAX_SAMPLES) {
        this.memoryUsage.shift()
      }

      // Log warning if memory usage is high
      if (totalMB > 500) {
        console.warn(`⚠️ High memory usage: ${totalMB}MB`)
      }
    }
  }

  static getMemoryStats(): {
    current: number
    average: number
    peak: number
    trend: "increasing" | "decreasing" | "stable"
  } {
    if (this.memoryUsage.length === 0) {
      return { current: 0, average: 0, peak: 0, trend: "stable" }
    }

    const current = this.memoryUsage[this.memoryUsage.length - 1]
    const average = this.memoryUsage.reduce((a, b) => a + b, 0) / this.memoryUsage.length
    const peak = Math.max(...this.memoryUsage)

    // Determine trend
    let trend: "increasing" | "decreasing" | "stable" = "stable"
    if (this.memoryUsage.length >= 5) {
      const recent = this.memoryUsage.slice(-5)
      const older = this.memoryUsage.slice(-10, -5)

      if (older.length > 0) {
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length

        if (recentAvg > olderAvg * 1.1) trend = "increasing"
        else if (recentAvg < olderAvg * 0.9) trend = "decreasing"
      }
    }

    return { current, average: Math.round(average), peak, trend }
  }

  static forceGarbageCollection(): void {
    if (typeof global !== "undefined" && global.gc) {
      console.log("🧹 Forcing garbage collection...")
      global.gc()
      this.trackMemoryUsage()
    }
  }

  static optimizeArrays<T>(arrays: T[][]): T[][] {
    // Remove empty arrays and compact sparse arrays
    return arrays
      .filter((arr) => arr && arr.length > 0)
      .map((arr) => arr.filter((item) => item !== undefined && item !== null))
  }

  static clearUnusedCaches(): void {
    // This would be implemented to clear various caches throughout the app
    console.log("🧹 Clearing unused caches...")
  }
}

// Auto-track memory usage
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    MemoryOptimizer.trackMemoryUsage()
  }, 30000) // Every 30 seconds
}
