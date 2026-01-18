/**
 * Diagnostic Application Service
 * High-level orchestrator for diagnostic reporting workflow
 * Coordinates report generation, analytics, and file writing
 * @module application/services/DiagnosticApplicationService
 */

import { injectable, inject } from 'inversify';

import { TOKENS } from '@/di/container';
import { DiagnosticError, ok, err, type Result, type WriteStats, type ILogger, type DiagnosticSource, type DiagnosticFileReport } from '@core';
import { type CollectionConfig } from '@domain';
import { DirectoryService, StructuredReportWriter } from '@infrastructure/filesystem/index.js';
import { EslintAdapter } from '@reporters/eslint/EslintAdapter.js';
import { TypeScriptAdapter } from '@reporters/typescript/TypeScriptAdapter.js';

import { GenerateReportUseCase, type ReportResult } from '../usecases/GenerateReport.js';

/**
 * Complete diagnostic reporting result
 */
export interface DiagnosticReportingResult extends ReportResult {
  readonly writeStats: WriteStats;
}

/**
 * Application service coordinating the complete diagnostic reporting workflow
 * Orchestrates: clear → collect → aggregate → analytics → write
 * Manages multiple diagnostic sources (ESLint, TypeScript) with configurable execution
 */
@injectable()
export class DiagnosticApplicationService {
  public constructor(
    @inject(TOKENS.LOGGER) private readonly logger: ILogger,
    @inject(TOKENS.ESLINT_ADAPTER) private readonly eslintAdapter: EslintAdapter,
    @inject(TOKENS.TYPESCRIPT_ADAPTER) private readonly typescriptAdapter: TypeScriptAdapter,
    @inject(TOKENS.GENERATE_REPORT_USE_CASE) private readonly generateReportUseCase: GenerateReportUseCase,
    @inject(TOKENS.STRUCTURED_REPORT_WRITER) private readonly writer: StructuredReportWriter,
    @inject(TOKENS.DIRECTORY_SERVICE) private readonly directoryService: DirectoryService
  ) {}

  /**
   * Generate and write diagnostic report
   * Complete workflow from collection to file output
   * @param config Collection configuration
   * @returns Result with diagnostics, stats, and write stats
   */
  public async generateAndWriteReport(
    config: CollectionConfig
  ): Promise<Result<DiagnosticReportingResult, DiagnosticError>> {
    try {
      // Step 1: Clear previous diagnostic errors
      await this.directoryService.clearAllErrors();

      // Step 2: Generate report (collect, aggregate, analytics)
      const reportResult = await this.generateReportUseCase.execute(config);

      if (!reportResult.isOk()) {
        return err(reportResult.error);
      }

      const { diagnostics, stats } = reportResult.value;

      // Step 3: Write structured reports
      // TODO: Integrate with DiagnosticMapper to create enriched reports
      // Currently passing empty map as writer expects Map<DiagnosticSource, DiagnosticFileReport[]>
      const emptyMap = new Map<DiagnosticSource, readonly DiagnosticFileReport[]>();
      const writeResult = await this.writer.write(emptyMap);

      if (!writeResult.isOk()) {
        return err(
          new DiagnosticError(
            'Failed to write report',
            {},
            writeResult.error instanceof Error ? writeResult.error : undefined
          )
        );
      }

      return ok({
        diagnostics,
        stats,
        writeStats: writeResult.value,
      });
    } catch (error) {
      return err(
        new DiagnosticError(
          'Failed to generate and write report',
          {},
          error instanceof Error ? error : undefined
        )
      );
    }
  }

  /**
   * Run ESLint analysis
   * @param patterns Glob patterns for files
   * @param configPath Optional path to eslint config
   * @param verbose Enable verbose logging
   */
  public async runEslint(
    patterns: readonly string[],
    configPath?: string,
    verbose = false
  ): Promise<Result<void, DiagnosticError>> {
    try {
      if (verbose) {
        this.logger.info('Running ESLint analysis', { patterns });
      }
      await this.eslintAdapter.lint(patterns, configPath);
      return ok(undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('ESLint analysis failed', { error: message });
      return err(
        new DiagnosticError(
          'ESLint analysis failed',
          { patterns: patterns.join(', ') },
          error instanceof Error ? error : undefined
        )
      );
    }
  }

  /**
   * Run TypeScript analysis
   * @param tsConfigPath Path to tsconfig.json
   * @param verbose Enable verbose logging
   */
  public async runTypeScript(
    tsConfigPath: string,
    verbose = false
  ): Promise<Result<void, DiagnosticError>> {
    try {
      if (verbose) {
        this.logger.info('Running TypeScript analysis', { tsConfigPath });
      }
      await this.typescriptAdapter.check(tsConfigPath);
      return ok(undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('TypeScript analysis failed', { error: message });
      return err(
        new DiagnosticError(
          'TypeScript analysis failed',
          { tsConfigPath },
          error instanceof Error ? error : undefined
        )
      );
    }
  }
}
