/**
 * Configuration utilities and defaults
 */

import type { CollectorConfig } from './types.js';

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: Readonly<CollectorConfig> = Object.freeze({
	cwd: process.cwd(),
	maxBuffer: 10 * 1024 * 1024, // 10MB
	timeout: 30000, // 30 seconds
	securityPolicy: 'strict',
	outputDir: undefined,
	includeSource: false,
	sanitize: true,
});

/**
 * Create a complete configuration by merging with defaults
 * @param partial - Partial configuration to merge
 * @returns Complete configuration
 */
export function createConfig(partial: Partial<CollectorConfig> = {}): CollectorConfig {
	return {
		...DEFAULT_CONFIG,
		...partial,
	};
}

/**
 * Validate configuration values
 * @param config - Configuration to validate
 * @throws Error if configuration is invalid
 */
export function validateConfig(config: CollectorConfig): void {
	if (config.maxBuffer <= 0) {
		throw new Error('maxBuffer must be positive');
	}
	if (config.timeout <= 0) {
		throw new Error('timeout must be positive');
	}
	if (!['strict', 'moderate'].includes(config.securityPolicy)) {
		throw new Error('securityPolicy must be "strict" or "moderate"');
	}
}
