/**
 * Application layer barrel export
 * Coordinates between layers with use-cases and services
 * @module application
 */

export { ReportGenerator, type ReportResult, type SourceStatistics } from './ReportGeneratorManager.js';
export { DiagnosticApplicationService, type DiagnosticReportingResult } from './DiagnosticApplicationService.js';
export { DiagnosticGrouper } from './DiagnosticGrouper.js';
export { FileReportBuilder } from './FileReportBuilder.js';
