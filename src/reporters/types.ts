/**
 * Core types and interfaces for diagnostic reporting
 */

/**
 * Represents a single diagnostic issue (error or warning)
 */
export interface Diagnostic {
	/** Normalized relative file path */
	readonly filePath: string;
	/** Line number (1-based) */
	readonly line: number;
	/** Column number (1-based) */
	readonly column: number;
	/** Severity level */
	readonly severity: 'error' | 'warning';
	/** Rule ID (ESLint) or error code (TypeScript) */
	readonly ruleId?: string;
	/** Diagnostic message (sanitized) */
	readonly message: string;
	/** Optional fix suggestion */
	readonly suggestion?: string;
	/** Source of the diagnostic */
	readonly source: 'eslint' | 'typescript';
}

/**
 * Summary statistics for diagnostics collection
 */
export interface DiagnosticsSummary {
	/** Total number of unique files with issues */
	readonly totalFiles: number;
	/** Total number of errors */
	readonly totalErrors: number;
	/** Total number of warnings */
	readonly totalWarnings: number;
	/** Processing time in milliseconds */
	readonly processingTimeMs: number;
}

/**
 * Metadata about the diagnostic collection run
 */
export interface DiagnosticsMetadata {
	/** Timestamp when report was generated */
	readonly reportedAt: Date;
	/** Version of the source tool (ESLint/TypeScript) */
	readonly sourceVersion?: string;
	/** Hostname where diagnostics were collected */
	readonly executedOn: string;
}

/**
 * Complete result of diagnostics collection
 */
export interface DiagnosticsResult {
	/** Array of all diagnostics found */
	readonly diagnostics: readonly Diagnostic[];
	/** Summary statistics */
	readonly summary: DiagnosticsSummary;
	/** Metadata about the collection */
	readonly metadata: DiagnosticsMetadata;
}

/**
 * Configuration for diagnostic collection
 */
export interface CollectorConfig {
	/** Working directory (default: process.cwd()) */
	readonly cwd: string;
	/** Maximum buffer size for streams (default: 10MB) */
	readonly maxBuffer: number;
	/** Timeout for operations in milliseconds (default: 30000) */
	readonly timeout: number;
	/** Security policy level */
	readonly securityPolicy: 'strict' | 'moderate';
	/** Custom output directory (overrides default .omnyreporter) */
	readonly outputDir?: string;
	/** Include source code snippets in diagnostics */
	readonly includeSource?: boolean;
	/** Sanitize sensitive data from messages */
	readonly sanitize: boolean;
	/** File patterns to analyze (default: ['src']) */
	readonly patterns?: readonly string[];
	/** Patterns to ignore/exclude */
	readonly ignorePatterns?: readonly string[];
}

/**
 * Validation status result
 */
export interface ValidationStatus {
	/** Whether validation passed */
	readonly valid: boolean;
	/** Validation errors if any */
	readonly errors: string[];
	/** Validation warnings */
	readonly warnings: string[];
}

/**
 * Statistics about write operations
 */
export interface WriteStats {
	/** Number of files written */
	readonly filesWritten: number;
	/** Total bytes written */
	readonly bytesWritten: number;
	/** Write duration in milliseconds */
	readonly durationMs: number;
	/** Any errors encountered */
	readonly errors: Error[];
}
