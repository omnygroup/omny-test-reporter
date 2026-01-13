/**
 * CLI for diagnostic reporting
 */

import process from 'node:process';

import type { ReportingConfig } from '../reporters/ReportingConfig.js';
import { ReportingOrchestrator } from '../reporters/ReportingOrchestrator.js';

interface CliArgs {
	run: 'eslint' | 'typescript' | 'all';
	output?: string;
	timeout?: number;
	verbose?: boolean;
	exitOnError?: boolean;
	cwd?: string;
	patterns?: string[];
	passThroughArgs?: string[];
}

function parseArgs(args: string[]): CliArgs {
	const result: CliArgs = {
		run: 'all',
		verbose: false,
		exitOnError: true,
	};

	let i = 0;
	while (i < args.length) {
		const arg = args[i];
		const next = args[i + 1];

		// Check for pass-through args separator
		if (arg === '--') {
			result.passThroughArgs = args.slice(i + 1);
			break;
		}

		switch (arg) {
			case '--run':
				if (next && ['eslint', 'typescript', 'all'].includes(next)) {
					result.run = next as 'eslint' | 'typescript' | 'all';
					i++;
				}
				break;
			case '--output':
			case '-o':
				if (next) {
					result.output = next;
					i++;
				}
				break;
			case '--timeout':
			case '-t':
				if (next) {
					result.timeout = parseInt(next, 10);
					i++;
				}
				break;
			case '--patterns':
				// Collect all patterns until next flag
				const patterns: string[] = [];
				i++;
				while (i < args.length) {
					const pattern = args[i];
					if (!pattern || pattern.startsWith('-')) {
						break;
					}
					patterns.push(pattern);
					i++;
				}
				if (patterns.length > 0) {
					result.patterns = patterns;
					i--; // Adjust because loop will increment at end
				}
				break;
			case '--verbose':
			case '-v':
				result.verbose = true;
				break;
			case '--no-exit-on-error':
				result.exitOnError = false;
				break;
			case '--cwd':
				if (next) {
					result.cwd = next;
					i++;
				}
				break;
			case '--help':
			case '-h':
				printHelp();
				process.exit(0);
				break;
		}

		i++;
	}

	return result;
}

function printHelp(): void {
	console.log(`
omny diagnostics - Report ESLint and TypeScript diagnostics

USAGE:
  omny diagnostics [OPTIONS] [-- PASS_THROUGH_ARGS]

OPTIONS:
  --run <type>              Which reporters to run: eslint, typescript, or all (default: all)
  --output, -o <dir>        Output directory (default: .omnyreporter)
  --timeout, -t <ms>        Timeout in milliseconds (default: 30000)
  --patterns <paths...>     File patterns to analyze (default: src)
  --verbose, -v             Enable verbose logging
  --no-exit-on-error        Don't exit with error code when diagnostics found
  --cwd <path>              Working directory (default: current directory)
  --help, -h                Show this help message

EXAMPLES:
  # Default (analyzes src/)
  omny diagnostics
  
  # ESLint only with custom patterns
  omny diagnostics --run eslint --patterns "src" "tests"
  
  # TypeScript with pass-through args
  omny diagnostics --run typescript -- --noEmit --strict
  
  # ESLint with options
  omny diagnostics --run eslint -- --fix --cache
  
  # Custom output
  omny diagnostics --run all --output ./reports --verbose

OUTPUT:
  Reports are written to .omnyreporter/{eslint,typescript}/errors/
  Each file with diagnostics gets a separate JSON file with structured error data.
`);
}

export async function runDiagnosticsCli(args: string[]): Promise<void> {
	const cliArgs = parseArgs(args);

	const config: ReportingConfig = {
		run: cliArgs.run,
		outputDir: cliArgs.output || '.omnyreporter',
		verbose: cliArgs.verbose || false,
		exitCodeOnError: cliArgs.exitOnError ?? true,
		cwd: cliArgs.cwd || process.cwd(),
		eslintConfig: {
			timeout: cliArgs.timeout || 30000, // Default 30 seconds
			patterns: cliArgs.patterns?.length ? cliArgs.patterns : ['src'],
		},
		typescriptConfig: {
			timeout: cliArgs.timeout || 30000, // Default 30 seconds
			patterns: cliArgs.patterns?.length ? cliArgs.patterns : ['src'],
		},
	};

	try {
		const orchestrator = new ReportingOrchestrator(config);
		const result = await orchestrator.execute();

		// Print results to console
		orchestrator.printResults(result);

		// Exit with appropriate code
		if (config.exitCodeOnError && !result.success) {
			process.exit(1);
		}
	} catch (error) {
		console.error('❌ Diagnostic reporting failed:', (error as Error).message);
		if (cliArgs.verbose) {
			console.error(error);
		}
		process.exit(2);
	}
}
