/**
 * TypeScript configuration types
 */

import type { CollectorConfig } from '../types.js';

/**
 * TypeScript-specific configuration
 */
export interface TypeScriptConfig extends CollectorConfig {
	/** Path to tsconfig.json (default: auto-detect) */
	readonly tsconfigPath?: string;
	/** Skip type checking of declaration files */
	readonly skipLibCheck?: boolean;
	/** Include declaration files in diagnostics */
	readonly includeDeclarationFiles?: boolean;
}
