/**
 * Core interfaces for diagnostic reporting system
 */

import type {
	CollectorConfig,
	Diagnostic,
	DiagnosticsResult,
	ValidationStatus,
	WriteStats,
} from './types.js';

/**
 * Generic diagnostic source provider
 */
export interface DiagnosticSource {
	/**
	 * Collect diagnostics from the source
	 * @param config - Collection configuration
	 * @returns Promise resolving to diagnostics result
	 */
	collect(config: CollectorConfig): Promise<DiagnosticsResult>;

	/**
	 * Validate that the source is available and properly configured
	 * @returns Promise resolving to validation status
	 */
	validate(): Promise<ValidationStatus>;
}

/**
 * Security validation interface
 */
export interface SecurityValidator {
	/**
	 * Check if a file path is safe to access/write
	 * @param filePath - Path to validate
	 * @returns true if path is safe
	 */
	isPathSafe(filePath: string): boolean;

	/**
	 * Sanitize a message to remove sensitive data
	 * @param message - Message to sanitize
	 * @returns Sanitized message
	 */
	sanitizeMessage(message: string): string;

	/**
	 * Validate that output directory is writable
	 * @param directory - Directory to validate
	 * @returns Promise resolving to true if directory is valid
	 */
	validateOutputDirectory(directory: string): Promise<boolean>;
}

/**
 * Path normalization interface
 */
export interface PathNormalizer {
	/**
	 * Normalize a file path (cross-platform)
	 * @param rawPath - Raw path to normalize
	 * @param baseDir - Optional base directory for relative paths
	 * @returns Normalized path
	 */
	normalize(rawPath: string, baseDir?: string): string;

	/**
	 * Check if path is absolute
	 * @param path - Path to check
	 * @returns true if path is absolute
	 */
	isAbsolute(path: string): boolean;
}

/**
 * Report writer interface
 */
export interface ReportWriter {
	/**
	 * Write diagnostics from a stream
	 * @param source - Async iterable of diagnostics
	 * @param type - Type of diagnostics ('eslint' or 'typescript')
	 * @returns Promise resolving to write statistics
	 */
	writeStream(source: AsyncIterable<Diagnostic>, type: 'eslint' | 'typescript'): Promise<WriteStats>;

	/**
	 * Get output path for a specific diagnostic type
	 * @param type - Type of diagnostics
	 * @returns Output path
	 */
	getOutputPath(type: 'eslint' | 'typescript'): string;
}

/**
 * Stream processor interface
 */
export interface StreamProcessor<T> {
	/**
	 * Process input stream and transform to output
	 * @param input - Input stream
	 * @returns Output stream
	 */
	pipe(input: AsyncIterable<unknown>): AsyncIterable<T>;

	/**
	 * Register error handler
	 * @param handler - Error handler function
	 */
	onError(handler: (error: Error) => void): void;
}

/**
 * Diagnostics aggregator interface
 */
export interface DiagnosticsAggregator {
	/**
	 * Aggregate diagnostics from a stream
	 * @param stream - Stream of diagnostics
	 * @returns Promise resolving to aggregated result
	 */
	aggregate(stream: AsyncIterable<Diagnostic>): Promise<DiagnosticsResult>;
}

/**
 * Logger interface
 */
export interface Logger {
	info(message: string, ...args: unknown[]): void;
	warn(message: string, ...args: unknown[]): void;
	error(message: string, ...args: unknown[]): void;
	debug(message: string, ...args: unknown[]): void;
}
