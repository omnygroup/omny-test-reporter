/**
 * Main CLI entry point
 */

import { runDiagnosticsCli } from './diagnostics.js';

export async function main(args: string[]): Promise<void> {
	const command = args[0];
	const commandArgs = args.slice(1);

	switch (command) {
		case 'diagnostics':
		case 'report':
			await runDiagnosticsCli(commandArgs);
			break;
		default:
			console.error(`Unknown command: ${command || '(none)'}`);
			console.error('Available commands: diagnostics, report');
			process.exit(1);
	}
}
