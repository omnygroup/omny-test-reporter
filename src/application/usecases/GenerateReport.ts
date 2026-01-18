/**
 * Generate report use-case
 * Orchestrates diagnostic collection, aggregation, enrichment, and reporting
 * @module application/usecases/GenerateReport
 */

import { injectable } from 'inversify';

import { DiagnosticError, ok, err, type IDiagnosticSource, type Diagnostic, type Result, type WriteStats } from '@core';
import { type CollectionConfig, DiagnosticAnalytics, DiagnosticAggregator } from '@domain';
import { SourceCodeEnricher } from '@domain/mappers/index.js';
import { DirectoryService, StructuredReportWriter } from '@infrastructure/filesystem/index.js';

/**
 * Result of report generation
 */
export interface ReportResult {
  readonly diagnostics: readonly Diagnostic[];
  readonly stats: ReturnType<DiagnosticAnalytics['getSnapshot']>;
  readonly writeStats: WriteStats;
}

/**
 * Use-case for generating diagnostic reports
 */
@injectable()
export class GenerateReportUseCase {
  public constructor(
    private readonly sources: readonly IDiagnosticSource[],
    private readonly enricher: SourceCodeEnricher,
    private readonly writer: StructuredReportWriter,
    private readonly directoryService: DirectoryService
  ) {}

  /**
   * Execute report generation
   * @param config Collection configuration
   * @returns Result with report data
   */
  public async execute(config: CollectionConfig): Promise<Result<ReportResult, DiagnosticError>> {
    try {
      // Clear previous diagnostic errors before collection
      // TODO: должно быть уровнем выше, а не частью execute
      await this.directoryService.clearAllErrors();

      // Collect diagnostics from all sources
      const results = await Promise.allSettled(
        // TODO: Нужно видеть как происходит collect для каждого source, потому что в логах этого нет сейчас. Должно быть опционально.
        this.sources.map(async (source) => source.collect(config))
      );

      // TODO: [diagnosticArrays]: start: должно быть часть DiagnosticAggregator
      const diagnosticArrays: Diagnostic[][] = [];
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value.isOk()) {
          // TODO: не должно быть тавтологии с value.value
          diagnosticArrays.push([...result.value.value]);
        }
      }
      // TODO: [diagnosticArrays]: end.

      // Aggregate diagnostics
      // TODO: DiagnosticAggregator.aggregate делает тоже самое, что и вышеописанный код с diagnosticArrays, объединить код
      const aggregated = DiagnosticAggregator.aggregate(diagnosticArrays);

      // Calculate statistics
      const analytics = new DiagnosticAnalytics();
      // TODO: зачем? Внутри коллект тоже кладет все в массив, убрать дублирование, объединить код
      aggregated.forEach((d) => { analytics.collect(d); });
      const stats = analytics.getSnapshot();

      // Group by source and file
      const grouped = DiagnosticAggregator.groupBySourceAndFile(aggregated);

      // Filter empty groups
      // TODO: Почему фильтрация здесь и почему она вообще есть? Это должно быть на этапе перед тем как данные начнут агрерироваться и обрабатываться аналитикой
      // Это должно быть частью DiagnosticAggregator наверное или сам подумай где лучше
      const filtered = new Map(Array.from(grouped).filter(([, fileMap]) => fileMap.size > 0));

      // Enrich with source code
      // TODO: Зачем нужен этот этап? Там внутри чтение файлов какиех-то.
      // Зачем чтеине файлов, если данные все собираются в памяти и только в конце они должны быть записаны в файл
      // Метаданные будут добавляться в другом месте, а значит enricher будет не нужен, так как он делает только чтение файлов
      const enrichResult = await this.enricher.enrichAll(filtered);

      if (!enrichResult.isOk()) {
        return err(
          new DiagnosticError(
            'Failed to enrich diagnostics',
            {},
            enrichResult.error instanceof Error ? enrichResult.error : undefined
          )
        );
      }

      // Write structured reports
      // TODO: Почему GenerateReportUseCase должен знать о writer? Это должен быть уровень выше, который отвечает за координацию всех этих частей
      const writeResult = await this.writer.write(enrichResult.value);

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
        diagnostics: aggregated,
        stats,
        writeStats: writeResult.value,
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
}

