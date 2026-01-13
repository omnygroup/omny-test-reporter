/**
 * Factory for creating ESLint reporter instances
 */

import type { Logger, PathNormalizer, SecurityValidator } from '../interfaces.js';
import { LoggerImpl } from '../shared/Logger.js';
import { PathNormalizerImpl } from '../shared/PathNormalizer.js';
import { SecurityValidatorImpl } from '../shared/SecurityValidator.js';
import type { EslintConfig } from './types.js';
import { EslintReporter } from './EslintReporter.js';
import { EslintLinterImpl } from './EslintLinter.js';
import { FileCollectorImpl } from './FileCollector.js';
import { LintMessageParserImpl } from './LintMessageParser.js';
import { LintStreamProcessorImpl } from './LintStreamProcessor.js';

export class EslintReporterFactory {
	/**
	 * Create a new ESLint reporter instance with all dependencies
	 */
	public static create(config: EslintConfig): EslintReporter {
		// Create shared dependencies
		const logger = new LoggerImpl();
		const pathNormalizer = new PathNormalizerImpl(config.cwd);
		const securityValidator = new SecurityValidatorImpl(config.cwd, config.securityPolicy);

		// Create ESLint-specific dependencies
		const linter = new EslintLinterImpl(config.cwd, logger, config.eslintConfigPath);
		const fileCollector = new FileCollectorImpl(
			config.cwd,
			logger,
			config.ignorePatterns ? Array.from(config.ignorePatterns) : undefined,
			config.extensions
		);
		const parser = new LintMessageParserImpl(
			pathNormalizer,
			securityValidator,
			config.sanitize
		);
		const streamProcessor = new LintStreamProcessorImpl(parser, logger);

		// Create reporter
		return new EslintReporter(
			logger,
			pathNormalizer,
			securityValidator,
			linter,
			fileCollector,
			streamProcessor
		);
	}

	/**
	 * Create with custom dependencies (for testing)
	 */
	public static createWithDependencies(
		config: EslintConfig,
		logger: Logger,
		pathNormalizer: PathNormalizer,
		securityValidator: SecurityValidator
	): EslintReporter {
		const linter = new EslintLinterImpl(config.cwd, logger, config.eslintConfigPath);
		const fileCollector = new FileCollectorImpl(
			config.cwd,
			logger,
			config.ignorePatterns ? Array.from(config.ignorePatterns) : undefined,
			config.extensions
		);
		const parser = new LintMessageParserImpl(
			pathNormalizer,
			securityValidator,
			config.sanitize
		);
		const streamProcessor = new LintStreamProcessorImpl(parser, logger);

		return new EslintReporter(
			logger,
			pathNormalizer,
			securityValidator,
			linter,
			fileCollector,
			streamProcessor
		);
	}
}
