/**
 * ESLint configuration types
 */

import type { CollectionConfig } from '../../domain/index.js';

/**
 * ESLint-specific configuration
 */
export interface EslintConfig extends CollectionConfig {
	/** Path to ESLint configuration file */
	readonly eslintConfigPath?: string;
	/** File extensions to lint */
	readonly extensions?: string[];
}
