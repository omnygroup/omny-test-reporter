/**
 * Diagnostics CLI command
 * @module view/cli/commands/diagnostics
 */

import { getContainer, TOKENS } from '@/di/container';
import { DiagnosticApplicationService } from '@application/DiagnosticApplicationService';
import { type ILogger, type Diagnostic, type IFormatter } from '@core';

import type { CollectionConfig } from '@domain/index.js';
import type { Container } from 'inversify';
import type { Arguments, CommandBuilder, Argv } from 'yargs';

export interface DiagnosticsOptions extends Arguments {
	patterns?: string[];
	eslint?: boolean;
	typescript?: boolean;
	deadCode?: boolean;
	format: 'json' | 'pretty' | 'table';
	output?: string;
	verbose: boolean;
}

export const command = 'diagnostics [patterns..]';
export const describe = 'Collect diagnostics from ESLint, TypeScript, and dead code analysis';

export const builder: CommandBuilder<unknown, DiagnosticsOptions> = (
	yargs: Argv<unknown>
): Argv<DiagnosticsOptions> => {
	return yargs
		.positional('patterns', {
			describe: 'Glob patterns for files to check',
			type: 'string',
			array: true,
			default: ['.'],
		})
		.option('eslint', {
			describe: 'Run ESLint (defaults to true if no other tool specified)',
			type: 'boolean',
		})
		.option('typescript', {
			describe: 'Run TypeScript checking (defaults to true if no other tool specified)',
			type: 'boolean',
		})
		.option('dead-code', {
			describe: 'Run dead code analysis (disabled by default)',
			type: 'boolean',
		})
		.option('format', {
			describe: 'Output format',
			type: 'string',
			choices: ['json', 'pretty', 'table'] as const,
			default: 'pretty' as const,
		})
		.option('output', {
			describe: 'Output file path',
			type: 'string',
			alias: 'o',
		})
		.option('verbose', {
			describe: 'Enable verbose logging',
			type: 'boolean',
			default: false,
		});
};

export async function handler(argv: DiagnosticsOptions): Promise<void> {
	try {
		const container = getContainer();
		const logger = container.get<ILogger>(TOKENS.LOGGER);
		const appService = container.get<DiagnosticApplicationService>(TOKENS.DIAGNOSTIC_APPLICATION_SERVICE);

		const runDeadCode = argv.deadCode === true;
		const runEslint = argv.eslint ?? (!runDeadCode && argv.typescript !== true);
		const runTypescript = argv.typescript ?? (!runDeadCode && argv.eslint !== true);

		if (argv.verbose) {
			logger.info('Starting diagnostics collection', {
				patterns: argv.patterns,
				eslint: runEslint,
				typescript: runTypescript,
				deadCode: runDeadCode,
				format: argv.format,
			});
		}

		// Build collection config
		const config: CollectionConfig = {
			patterns: argv.patterns ?? ['src/**/*.ts', 'src/**/*.tsx'],
			rootPath: process.cwd(),
			concurrency: 4,
			timeout: 30000,
			cache: false,
			ignorePatterns: [],
			eslint: runEslint,
			typescript: runTypescript,
			deadCode: runDeadCode,
			configPath: undefined,
			verboseLogging: argv.verbose,
		};

		if (!runEslint && !runTypescript && !runDeadCode) {
			logger.warn('No diagnostic sources enabled. Use --eslint, --typescript, or --dead-code to enable sources.');
			return;
		}

		// Execute report generation and writing via application service
		const result = await appService.run(config);

		if (!result.isOk()) {
			logger.error('Failed to generate report', result.error);
			console.error('\nError:', result.error.message);
			process.exit(1);
		}

		const { diagnostics, writeStats } = result.value;

		// Format and print diagnostics to console
		printDiagnostics(container, argv.format, diagnostics);

		if (argv.verbose) {
			logger.info('Diagnostics collection completed', {
				count: diagnostics.length,
				format: argv.format,
				filesWritten: writeStats.filesWritten,
			});
		}

		process.stdout.write(`\nSuccessfully processed ${String(diagnostics.length)} issues.` + '\n');
		process.stdout.write(
			`Detailed reports written to .omnyreporter/ directory (${String(writeStats.filesWritten)} files).` + '\n'
		);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error('Fatal error:', message);
		if (error instanceof Error && typeof error.stack === 'string') {
			console.error(error.stack);
		}
		process.exit(1);
	}
}

function printDiagnostics(
	container: Container,
	format: DiagnosticsOptions['format'],
	diagnostics: readonly Diagnostic[]
): void {
	if (format === 'json') {
		const formatter = container.get<IFormatter<readonly Diagnostic[]>>(TOKENS.JSON_FORMATTER);
		process.stdout.write(formatter.format(diagnostics) + '\n');
	} else if (format === 'table') {
		const formatter = container.get<IFormatter<readonly Diagnostic[]>>(TOKENS.TABLE_FORMATTER);
		process.stdout.write(formatter.format(diagnostics) + '\n');
	} else {
		const formatter = container.get<IFormatter<Diagnostic>>(TOKENS.CONSOLE_FORMATTER);
		diagnostics.forEach((d) => {
			process.stdout.write(formatter.format(d) + '\n');
		});
	}
}
