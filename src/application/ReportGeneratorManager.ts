/**
 * Report Generator
 * Orchestrates diagnostic collection, aggregation, and analytics
 * @module application/ReportGenerator
 */

import { injectable, multiInject, inject } from 'inversify';

import { TOKENS } from '@/di/tokens.js';
import { collectFromSources } from '@/infrastructure/utils/ResultAnalyzer.js';
import { DiagnosticError, ok, err, type DiagnosticIntegration, type Diagnostic, type DiagnosticStatistics, type Result, type ILogger, IntegrationName, BaseReportGenerator } from '@core';
import { type CollectionConfig } from '@domain';
import { DiagnosticAnalytics } from '@domain/analytics/DiagnosticAnalytics.js';

/**
 * Source statistics
 */
export interface SourceStatistics {
  readonly total: number;
  readonly successful: number;
  readonly failed: number;
}

/**
 * Result of report generation
 */
export interface ReportResult {
  readonly diagnostics: readonly Diagnostic[];
  readonly stats: DiagnosticStatistics;
  readonly sourceStats: SourceStatistics;
}

/**
 * Use-case for generating diagnostic reports
 * Returns data without writing - writing handled by ApplicationService
 *
 * Dependencies:
 * - sources: Diagnostic sources (ESLint, TypeScript reporters)
 * - analytics: Calculates statistics (uses DiagnosticAnalytics for collectAll batch method)
 */
@injectable()
export class ReportGenerator {
  public constructor(
    @multiInject(TOKENS.DIAGNOSTIC_INTEGRATION) private readonly sources: DiagnosticIntegration[],
    @inject(TOKENS.DIAGNOSTIC_ANALYTICS) private readonly analytics: DiagnosticAnalytics,
    @inject(TOKENS.LOGGER) private readonly logger: ILogger
  ) {}

  public async generate(config: CollectionConfig): Promise<Result<ReportResult, DiagnosticError>> {
    try {
      // Filter sources based on configuration
      const activeSources = this.filterActiveSources(config);

      if (activeSources.length === 0) {
        return err(
          new DiagnosticError(
            'No diagnostic sources enabled',
            { config: { eslint: config.eslint, typescript: config.typescript } }
          )
        );
      }

      this.logger.info('Collecting diagnostics from sources', {
        sources: activeSources.map((s) => s.getName()),
        total: activeSources.length,
      });

      const { diagnostics, successCount } = await BaseReportGenerator.collectFromSources(activeSources, config);

      this.logger.info('Diagnostic collection completed', {
        collected: diagnostics.length,
        successful: successCount,
        failed: activeSources.length - successCount,
      });

      // Calculate statistics
      this.analytics.reset();
      this.analytics.collectAll(diagnostics);
      const stats = this.analytics.getSnapshot();

      return ok({
        diagnostics,
        stats,
        sourceStats: {
          total: activeSources.length,
          successful: successCount,
          failed: activeSources.length - successCount,
        },
      });
    } catch (error) {
      return err(
        new DiagnosticError(
          'Failed to generate report',
          {},
          error instanceof Error ? error : undefined
        )
      );
    }
  }


  private filterActiveSources(config: CollectionConfig): readonly DiagnosticIntegration[] {
    return this.sources.filter((source) => {
      const name = source.getName();

      // Check ESLint flag
      if (name.includes(IntegrationName.ESLint)) {
        return !config.eslint ? false : true;
      }

      // Check TypeScript flag
      if (name.includes(IntegrationName.TypeScript)) {
        return !config.typescript ? false : true;
      }

      // Include other sources (vitest, etc.) by default
      return true;
    });
  }


  private async collectWithTimeout(
    source: DiagnosticIntegration,
    config: CollectionConfig
  ): Promise<Result<readonly Diagnostic[], DiagnosticError>> {
    const timeout = config.timeout;
    const hasTimeout = timeout > 0;

    if (!hasTimeout) {
      return source.collect(config);
    }

    return Promise.race([
      source.collect(config),
      this.createTimeoutPromise(timeout, source.getName()),
    ]);
  }

  private async createTimeoutPromise(
    ms: number,
    sourceName: string
  ): Promise<never> {
    return new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(
          new DiagnosticError(
            `Source ${sourceName} timed out after ${String(ms)}ms`,
            { source: sourceName, timeout: ms }
          )
        );
      }, ms);
    });
  }
}
