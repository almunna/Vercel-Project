// Performance monitoring utility
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map()
  private static readonly MAX_SAMPLES = 100

  static startTimer(operation: string): () => number {
    const startTime = performance.now()

    return () => {
      const duration = performance.now() - startTime
      this.recordMetric(operation, duration)
      return duration
    }
  }

  static recordMetric(operation: string, duration: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, [])
    }

    const samples = this.metrics.get(operation)!
    samples.push(duration)

    // Keep only recent samples
    if (samples.length > this.MAX_SAMPLES) {
      samples.shift()
    }
  }

  static getStats(operation: string): {
    avg: number
    min: number
    max: number
    count: number
  } | null {
    const samples = this.metrics.get(operation)
    if (!samples || samples.length === 0) return null

    return {
      avg: samples.reduce((a, b) => a + b, 0) / samples.length,
      min: Math.min(...samples),
      max: Math.max(...samples),
      count: samples.length,
    }
  }

  static getAllStats(): Record<string, any> {
    const stats: Record<string, any> = {}
    for (const [operation, samples] of this.metrics.entries()) {
      if (samples.length > 0) {
        stats[operation] = this.getStats(operation)
      }
    }
    return stats
  }

  static logStats(): void {
    const stats = this.getAllStats()
    console.table(stats)
  }

  static clear(): void {
    this.metrics.clear()
  }
}
