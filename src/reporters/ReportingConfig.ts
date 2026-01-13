/**
 * Reporting configuration types
 */

import type { EslintConfig } from './eslint/types.js';
import type { TypeScriptConfig } from './typescript/types.js';

/**
 * Combined reporting configuration
 */
export interface ReportingConfig {
	/** Which reporters to run */
	readonly run: 'eslint' | 'typescript' | 'all';
	/** Output directory for reports */
	readonly outputDir: string;
	/** Enable verbose logging */
	readonly verbose: boolean;
	/** Return non-zero exit code on errors */
	readonly exitCodeOnError: boolean;
	/** Working directory */
	readonly cwd: string;
	/** ESLint-specific configuration */
	readonly eslintConfig?: Partial<EslintConfig>;
	/** TypeScript-specific configuration */
	readonly typescriptConfig?: Partial<TypeScriptConfig>;
}

/**
 * Combined reporting result
 */
export interface ReporterResult {
	success: boolean;
	errors: number;
	warnings: number;
	files: number;
	durationMs: number;
}

export interface CombinedReportingResult {
	/** ESLint results (if run) */
	eslint?: ReporterResult;
	/** TypeScript results (if run) */
	typescript?: ReporterResult;
	/** Overall success status */
	success: boolean;
	/** Total errors across all reporters */
	totalErrors: number;
	/** Total warnings across all reporters */
	totalWarnings: number;
	/** Files written */
	filesWritten: number;
}
