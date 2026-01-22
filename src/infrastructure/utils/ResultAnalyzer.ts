/**
 * Result Analyzer
 * Utilities for analyzing Promise.allSettled results
 * @module infrastructure/utils/ResultAnalyzer
 */

export function countTimedOutResults(
  results: readonly PromiseSettledResult<unknown>[]
): number {
  let count = 0;

  for (const result of results) {
    if (
      result.status === 'rejected' &&
      result.reason instanceof Error &&
      result.reason.message.includes('timeout')
    ) {
      count += 1;
    }
  }

  return count;
}
