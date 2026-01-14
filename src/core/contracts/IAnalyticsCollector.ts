/**
 * Analytics collector contract
 * @module core/contracts/IAnalyticsCollector
 */

import type { StatisticsBase } from '../types/index.js';

export interface IAnalyticsCollector<TInput, TStats extends StatisticsBase> {
  /**
   * Collect and aggregate input data
   * @param input Data to collect
   */
  collect(input: TInput): void;

  /**
   * Get current statistics snapshot
   * @returns Snapshot of current statistics
   */
  getSnapshot(): TStats;

  /**
   * Reset all collected statistics
   */
  reset(): void;
}
