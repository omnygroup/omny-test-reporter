/**
 * Main CLI entry point
 * @module cli
 */

import { executeDiagnostics } from './diagnostics.js';
import type { CollectionConfig } from '../domain/index.js';
import { PinoLogger } from '../infrastructure/logging/PinoLogger.js';

/**
 * Main CLI entry point
 * @param args Command line arguments
 */
export async function main(args: string[]): Promise<void> {
	const logger = new PinoLogger();
	const command = args[0];

	try {
		switch (command) {
			case 'diagnostics':
			case 'report': {
				const config: CollectionConfig = {
					patterns: ['src/**/*.ts'],
					rootPath: process.cwd(),
					concurrency: 4,
					timeout: 30000,
					cache: false,
					ignorePatterns: ['node_modules', 'dist'],
					eslint: true,
					typescript: true,
				};
				await executeDiagnostics(config, logger);
				break;
			}
			case undefined:
			default: {
				const commandName = command ?? '(none)';
				logger.error(`Unknown command: ${commandName}`);
				console.error('Available commands: diagnostics, report');
				process.exit(1);
			}
		}
	} catch (error) {
		logger.error('CLI execution failed', error instanceof Error ? error : new Error(String(error)));
		process.exit(1);
	}
}
