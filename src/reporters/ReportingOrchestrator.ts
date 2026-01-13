/**
 * Reporting orchestrator - coordinates multiple reporters
 */

import fs from 'node:fs/promises';
import path from 'node:path';

import type { Logger } from './interfaces.js';
import { LoggerImpl } from './shared/Logger.js';
import { DirectoryManager } from './shared/DirectoryManager.js';
import type { ReportingConfig, CombinedReportingResult } from './ReportingConfig.js';
import { ReportingFacade } from './ReportingFacade.js';

export class ReportingOrchestrator {
	readonly #config: ReportingConfig;
	readonly #facade: ReportingFacade;
	readonly #logger: Logger;
	readonly #directoryManager: DirectoryManager;

	public constructor(config: ReportingConfig) {
		this.#config = config;
		this.#facade = new ReportingFacade(config.cwd, config.outputDir);
		this.#logger = new LoggerImpl({
			level: config.verbose ? 'debug' : 'info',
		});
		this.#directoryManager = new DirectoryManager(config.outputDir, config.cwd);
	}

	/**
	 * Execute reporters based on configuration
	 */
	public async execute(): Promise<CombinedReportingResult> {
		this.#logger.info('Starting diagnostic reporting', {
			run: this.#config.run,
			cwd: this.#config.cwd,
		});

		const startTime = Date.now();
		const result: CombinedReportingResult = {
			success: true,
			totalErrors: 0,
			totalWarnings: 0,
			filesWritten: 0,
		};

		try {
			if (this.#config.run === 'eslint') {
				await this.#runEslint(result);
			} else if (this.#config.run === 'typescript') {
				await this.#runTypeScript(result);
			} else {
				// Run both in parallel
				await this.#runAll(result);
			}

			// Write combined summary
			await this.#writeSummary(result);

			const duration = Date.now() - startTime;
			this.#logger.info('Diagnostic reporting completed', {
				success: result.success,
				totalErrors: result.totalErrors,
				totalWarnings: result.totalWarnings,
				filesWritten: result.filesWritten,
				durationMs: duration,
			});

			return result;
		} catch (error) {
			this.#logger.error('Diagnostic reporting failed', { error });
			throw error;
		}
	}

	async #runEslint(result: CombinedReportingResult): Promise<void> {
		const startTime = Date.now();
		
		try {
			const { result: eslintResult, writeStats } = await this.#facade.collectEslintDiagnostics(
				this.#config.eslintConfig
			);

			result.eslint = {
				success: eslintResult.summary.totalErrors === 0,
				errors: eslintResult.summary.totalErrors,
				warnings: eslintResult.summary.totalWarnings,
				files: eslintResult.summary.totalFiles,
				durationMs: Date.now() - startTime,
			};

			result.totalErrors += eslintResult.summary.totalErrors;
			result.totalWarnings += eslintResult.summary.totalWarnings;
			result.filesWritten += writeStats.filesWritten;

			if (eslintResult.summary.totalErrors > 0) {
				result.success = false;
			}
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : String(error);
			console.error('ESLint collection error:', errorMsg);
			if (error instanceof Error && error.stack) {
				console.error(error.stack);
			}
			this.#logger.error('ESLint reporting failed', { error: errorMsg });
			result.success = false;
			result.eslint = {
				success: false,
				errors: 0,
				warnings: 0,
				files: 0,
				durationMs: Date.now() - startTime,
			};
		}
	}

	async #runTypeScript(result: CombinedReportingResult): Promise<void> {
		const startTime = Date.now();
		
		try {
			const { result: tsResult, writeStats } = await this.#facade.collectTypeScriptDiagnostics(
				this.#config.typescriptConfig
			);

			result.typescript = {
				success: tsResult.summary.totalErrors === 0,
				errors: tsResult.summary.totalErrors,
				warnings: tsResult.summary.totalWarnings,
				files: tsResult.summary.totalFiles,
				durationMs: Date.now() - startTime,
			};

			result.totalErrors += tsResult.summary.totalErrors;
			result.totalWarnings += tsResult.summary.totalWarnings;
			result.filesWritten += writeStats.filesWritten;

			if (tsResult.summary.totalErrors > 0) {
				result.success = false;
			}
		} catch (error) {
			this.#logger.error('TypeScript reporting failed', { error });
			result.success = false;
			result.typescript = {
				success: false,
				errors: 0,
				warnings: 0,
				files: 0,
				durationMs: Date.now() - startTime,
			};
		}
	}

	async #runAll(result: CombinedReportingResult): Promise<void> {
		// Run both in parallel
		await Promise.all([
			this.#runEslint(result),
			this.#runTypeScript(result),
		]);
	}

	async #writeSummary(result: CombinedReportingResult): Promise<void> {
		const summaryPath = path.join(this.#directoryManager.getRootDir(), 'report.json');
		
		try {
			await fs.mkdir(path.dirname(summaryPath), { recursive: true });
			await fs.writeFile(summaryPath, JSON.stringify(result, null, 2), 'utf8');
			this.#logger.debug('Summary written', { path: summaryPath });
		} catch (error) {
			this.#logger.warn('Failed to write summary', { error });
		}
	}

	/**
	 * Print results to console
	 */
	public printResults(result: CombinedReportingResult): void {
		console.log('\n📊 Diagnostic Report Summary\n');
		console.log('═'.repeat(60));

		if (result.eslint) {
			console.log('\n📝 ESLint:');
			console.log(`   Files:    ${result.eslint.files}`);
			console.log(`   Errors:   ${result.eslint.errors}`);
			console.log(`   Warnings: ${result.eslint.warnings}`);
			console.log(`   Duration: ${result.eslint.durationMs}ms`);
			console.log(`   Status:   ${result.eslint.success ? '✅ PASS' : '❌ FAIL'}`);
		}

		if (result.typescript) {
			console.log('\n📘 TypeScript:');
			console.log(`   Files:    ${result.typescript.files}`);
			console.log(`   Errors:   ${result.typescript.errors}`);
			console.log(`   Warnings: ${result.typescript.warnings}`);
			console.log(`   Duration: ${result.typescript.durationMs}ms`);
			console.log(`   Status:   ${result.typescript.success ? '✅ PASS' : '❌ FAIL'}`);
		}

		console.log('\n' + '═'.repeat(60));
		console.log(`\n📦 Total Errors:   ${result.totalErrors}`);
		console.log(`⚠️  Total Warnings: ${result.totalWarnings}`);
		console.log(`📁 Files Written:  ${result.filesWritten}`);
		console.log(`\n${result.success ? '✅ All checks passed!' : '❌ Some checks failed.'}\n`);
	}
}
