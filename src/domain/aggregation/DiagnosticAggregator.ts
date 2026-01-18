/**
 * Diagnostics aggregator
 * Combines and processes diagnostics from multiple sources
 * @module domain/analytics/diagnostics/DiagnosticAggregator
 */

import { injectable } from 'inversify';

import type { Diagnostic, Result } from '@core';

/**
 * Diagnostic aggregator service
 * Central domain service for aggregating and processing diagnostics
 */
@injectable()
export class DiagnosticAggregator {
  /**
   * Aggregate diagnostics from multiple arrays
   * @param sources Arrays of diagnostics from different collectors
   * @returns Combined array of all diagnostics
   */
  public aggregate(sources: readonly (readonly Diagnostic[])[]): readonly Diagnostic[] {
    const results: Diagnostic[] = [];

    for (const source of sources) {
      results.push(...source);
    }

    return results;
  }

  /**
   * Aggregate results from Promise.allSettled
   * Extracts successful diagnostic collections and flattens them
   * @param results PromiseSettledResult array from diagnostic collection
   * @returns Aggregated diagnostics and success count
   */
  public aggregateResults(
    results: readonly PromiseSettledResult<Result<readonly Diagnostic[], Error>>[]
  ): { diagnostics: readonly Diagnostic[]; successCount: number } {
    const diagnosticArrays: Diagnostic[][] = [];
    let successCount = 0;

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.isOk()) {
        diagnosticArrays.push([...result.value.value]);
        successCount += 1;
      }
    }

    const aggregated = this.aggregate(diagnosticArrays);

    return { diagnostics: aggregated, successCount };
  }
}
