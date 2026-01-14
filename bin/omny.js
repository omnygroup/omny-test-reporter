#!/usr/bin/env node

/**
 * OmnyReporter CLI Entry Point
 * Routes to appropriate command handlers
 */

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = join(__dirname, '..', 'dist');

async function main() {
	try {
		const { default: app } = await import(join(distPath, 'cli', 'index.js'));
		await app();
	} catch (error) {
		console.error('Failed to start CLI:', error instanceof Error ? error.message : String(error));
		if (process.env.DEBUG) {
			console.error(error);
		}
		process.exit(1);
	}
}

main().catch(() => process.exit(1));
