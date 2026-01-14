/**
 * Diagnostics aggregator
 * Combines diagnostics from multiple sources
 * @module domain/analytics/diagnostics/DiagnosticAggregator
 */

import type { Diagnostic } from '../../../core/index.js';

/**
 * Aggregates diagnostics from multiple sources
 */
export class DiagnosticAggregator {
  /**
   * Merge multiple diagnostic arrays and remove duplicates
   * @param sources Multiple diagnostic arrays
   * @returns Merged and deduplicated diagnostics
   */
  public static aggregate(...sources: readonly (readonly Diagnostic[])[]): readonly Diagnostic[] {
    const seen = new Set<string>();
    const results: Diagnostic[] = [];

    sources.forEach((source) => {
      source.forEach((diagnostic) => {
        if (!seen.has(diagnostic.id)) {
          seen.add(diagnostic.id);
          results.push(diagnostic);
        }
      });
    });

    // Sort by file and line
    results.sort((a, b) => {
      if (a.filePath !== b.filePath) {
        return a.filePath.localeCompare(b.filePath);
      }
      if (a.line !== b.line) {
        return a.line - b.line;
      }
      return a.column - b.column;
    });

    return Object.freeze(results);
  }

  /**
   * Filter diagnostics by severity
   * @param diagnostics Diagnostics to filter
   * @param severity Severity to filter by
   * @returns Filtered diagnostics
   */
  public static filterBySeverity(
    diagnostics: readonly Diagnostic[],
    severity: string
  ): readonly Diagnostic[] {
    return Object.freeze(diagnostics.filter((d) => d.severity === severity));
  }

  /**
   * Filter diagnostics by file
   * @param diagnostics Diagnostics to filter
   * @param filePath File path to filter by
   * @returns Filtered diagnostics
   */
  public static filterByFile(
    diagnostics: readonly Diagnostic[],
    filePath: string
  ): readonly Diagnostic[] {
    return Object.freeze(diagnostics.filter((d) => d.filePath === filePath));
  }
}
