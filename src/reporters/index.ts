/**
 * Reporters module - main entry point
 */

// Core types and interfaces
export type {
	Diagnostic,
	DiagnosticsSummary,
	DiagnosticsMetadata,
	DiagnosticsResult,
	CollectorConfig,
	ValidationStatus,
	WriteStats,
} from './types.js';

export type {
	DiagnosticSource,
	SecurityValidator,
	PathNormalizer,
	ReportWriter,
	StreamProcessor,
	DiagnosticsAggregator,
	Logger,
} from './interfaces.js';

// Configuration
export { DEFAULT_CONFIG, createConfig, validateConfig } from './config.js';

// ESLint reporter
export type { EslintConfig } from './eslint/types.js';
export { EslintReporter } from './eslint/EslintReporter.js';
export { EslintReporterFactory } from './eslint/EslintReporterFactory.js';

// TypeScript reporter
export type { TypeScriptConfig } from './typescript/types.js';
export { TypeScriptReporter } from './typescript/TypeScriptReporter.js';
export { TypeScriptReporterFactory } from './typescript/TypeScriptReporterFactory.js';

// Facades and orchestration
export type { ReportingConfig, CombinedReportingResult } from './ReportingConfig.js';
export { ReportingFacade } from './ReportingFacade.js';
export { ReportingOrchestrator } from './ReportingOrchestrator.js';

// Shared utilities (for advanced usage)
export { PathNormalizerImpl } from './shared/PathNormalizer.js';
export { SecurityValidatorImpl } from './shared/SecurityValidator.js';
export { DirectoryManager } from './shared/DirectoryManager.js';
export { LoggerImpl } from './shared/Logger.js';
export { JsonReportWriter } from './shared/JsonReportWriter.js';
export { DiagnosticsAggregatorImpl } from './shared/DiagnosticsAggregator.js';
export { BaseDiagnosticSource } from './shared/BaseDiagnosticSource.js';
