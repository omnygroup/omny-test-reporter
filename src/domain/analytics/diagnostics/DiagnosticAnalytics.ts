/**
 * Diagnostic analytics collector
 * @module domain/analytics/diagnostics/DiagnosticAnalytics
 */

import { BaseAnalyticsCollector ,type  Diagnostic,type  DiagnosticStatistics } from '@core';
import { StatisticsCalculator } from '@domain/analytics/base/index.js';

/**
 * Analytics collector for diagnostics
 * Aggregates diagnostic data and calculates statistics
 */
export class DiagnosticAnalytics extends BaseAnalyticsCollector<
  Diagnostic,
  DiagnosticStatistics
> {
  private diagnostics: Diagnostic[] = [];

  public constructor() {
    super();
  }

  /**
   * Collect a single diagnostic and update statistics
   * @param diagnostic Single diagnostic to collect
   * @returns void
   */
  public collect(diagnostic: Diagnostic): void {
    this.diagnostics.push(diagnostic);
    // TODO: StatisticsCalculator выглядит так, как будто это должно быть композициейный паттерн внутри DiagnosticAnalytics, а не утилита
    // Или это должен быть метод updateStats внутри BaseAnalyticsCollector?
    this.stats = StatisticsCalculator.calculateDiagnosticStats(this.diagnostics);
  }

  // TODO: Нужен zod
  protected createInitialStats(): DiagnosticStatistics {
    return {
      timestamp: new Date(),
      totalCount: 0,
      errorCount: 0,
      warningCount: 0,
      infoCount: 0,
      noteCount: 0,
      totalByFile: {},
      totalBySeverity: {
        error: 0,
        warning: 0,
        info: 0,
        note: 0,
      },
      totalByCode: {},
    };
  }

  /**
   * Get all collected diagnostics
   * @returns Array of diagnostics
   */
  public getDiagnostics(): readonly Diagnostic[] {
    return Object.freeze([...this.diagnostics]);
  }

  public override reset(): void {
    this.diagnostics = [];
    super.reset();
  }
}
