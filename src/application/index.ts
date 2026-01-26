/**
 * Application layer barrel export
 * Coordinates between layers with use-cases and services
 * @module application
 */

export { ReportGenerator, type ReportResult, type IntegrationStatistics } from './ReportGeneratorManager.js';
export { DiagnosticApplicationService, type DiagnosticReportingResult } from './DiagnosticApplicationService.js';
