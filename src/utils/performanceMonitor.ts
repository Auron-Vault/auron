/**
 * Performance monitoring utility for tracking screen transitions and operations
 */

type TimingEntry = {
  label: string;
  startTime: number;
  endTime?: number;
  duration?: number;
};

class PerformanceMonitor {
  private timings: Map<string, TimingEntry> = new Map();
  private enabled: boolean = __DEV__; // Only enable in development

  /**
   * Start timing an operation
   */
  start(label: string): void {
    if (!this.enabled) return;

    this.timings.set(label, {
      label,
      startTime: Date.now(),
    });

    console.log(`[Performance] ⏱️  START: ${label}`);
  }

  /**
   * End timing an operation and log the duration
   */
  end(label: string): number | null {
    if (!this.enabled) return null;

    const entry = this.timings.get(label);
    if (!entry) {
      console.warn(`[Performance] ⚠️  No start time found for: ${label}`);
      return null;
    }

    const endTime = Date.now();
    const duration = endTime - entry.startTime;

    entry.endTime = endTime;
    entry.duration = duration;

    // Color code based on duration
    let emoji = '✅';
    if (duration > 2000) emoji = '🔴'; // Very slow
    else if (duration > 1000) emoji = '🟡'; // Slow
    else if (duration > 500) emoji = '🟠'; // Moderate

    console.log(
      `[Performance] ${emoji} END: ${label} - Duration: ${duration}ms`,
    );

    return duration;
  }

  /**
   * Measure a specific function execution time
   */
  async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
    if (!this.enabled) return fn();

    this.start(label);
    try {
      const result = await fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }

  /**
   * Measure a synchronous function execution time
   */
  measureSync<T>(label: string, fn: () => T): T {
    if (!this.enabled) return fn();

    this.start(label);
    try {
      const result = fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }

  /**
   * Get all recorded timings
   */
  getTimings(): TimingEntry[] {
    return Array.from(this.timings.values());
  }

  /**
   * Clear all timings
   */
  clear(): void {
    this.timings.clear();
  }

  /**
   * Generate a summary report
   */
  report(): void {
    if (!this.enabled) return;

    console.log('\n[Performance] 📊 SUMMARY REPORT');
    console.log('================================');

    const entries = this.getTimings();
    const sortedEntries = entries
      .filter(e => e.duration !== undefined)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0));

    sortedEntries.forEach(entry => {
      const emoji =
        (entry.duration || 0) > 2000
          ? '🔴'
          : (entry.duration || 0) > 1000
          ? '🟡'
          : (entry.duration || 0) > 500
          ? '🟠'
          : '✅';
      console.log(`${emoji} ${entry.label}: ${entry.duration}ms`);
    });

    console.log('================================\n');
  }
}

// Export singleton instance
export const perfMonitor = new PerformanceMonitor();

// Export convenience functions
export const startTiming = (label: string) => perfMonitor.start(label);
export const endTiming = (label: string) => perfMonitor.end(label);
export const measureAsync = <T>(label: string, fn: () => Promise<T>) =>
  perfMonitor.measure(label, fn);
export const measureSync = <T>(label: string, fn: () => T) =>
  perfMonitor.measureSync(label, fn);
export const reportPerformance = () => perfMonitor.report();
