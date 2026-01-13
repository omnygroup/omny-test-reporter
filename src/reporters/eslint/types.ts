/**
 * ESLint configuration types
 */

import type { CollectorConfig } from '../types.js';

/**
 * ESLint-specific configuration
 */
export interface EslintConfig extends CollectorConfig {
	/** Path to ESLint configuration file */
	readonly eslintConfigPath?: string;
	/** File extensions to lint */
	readonly extensions?: string[];
}
