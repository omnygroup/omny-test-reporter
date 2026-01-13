/**
 * Factory for creating TypeScript reporter instances
 */

import type { Logger, PathNormalizer, SecurityValidator } from '../interfaces.js';
import { LoggerImpl } from '../shared/Logger.js';
import { PathNormalizerImpl } from '../shared/PathNormalizer.js';
import { SecurityValidatorImpl } from '../shared/SecurityValidator.js';
import type { TypeScriptConfig } from './types.js';
import { TypeScriptReporter } from './TypeScriptReporter.js';
import { TypeScriptCompilerImpl } from './TypeScriptCompiler.js';
import { TypeScriptMessageFormatterImpl } from './TypeScriptMessageFormatter.js';
import { DiagnosticsParserImpl } from './DiagnosticsParser.js';
import { TscStreamProcessorImpl } from './TscStreamProcessor.js';

export class TypeScriptReporterFactory {
	/**
	 * Create a new TypeScript reporter instance with all dependencies
	 */
	public static create(config: TypeScriptConfig): TypeScriptReporter {
		// Create shared dependencies
		const logger = new LoggerImpl();
		const pathNormalizer = new PathNormalizerImpl(config.cwd);
		const securityValidator = new SecurityValidatorImpl(config.cwd, config.securityPolicy);

		// Create TypeScript-specific dependencies
		const compiler = new TypeScriptCompilerImpl(config.cwd, logger);
		const formatter = new TypeScriptMessageFormatterImpl();
		const parser = new DiagnosticsParserImpl(
			formatter,
			pathNormalizer,
			securityValidator,
			config.sanitize
		);
		const streamProcessor = new TscStreamProcessorImpl(parser, logger);

		// Create reporter
		return new TypeScriptReporter(
			logger,
			pathNormalizer,
			securityValidator,
			compiler,
			streamProcessor
		);
	}

	/**
	 * Create with custom dependencies (for testing)
	 */
	public static createWithDependencies(
		config: TypeScriptConfig,
		logger: Logger,
		pathNormalizer: PathNormalizer,
		securityValidator: SecurityValidator
	): TypeScriptReporter {
		const compiler = new TypeScriptCompilerImpl(config.cwd, logger);
		const formatter = new TypeScriptMessageFormatterImpl();
		const parser = new DiagnosticsParserImpl(
			formatter,
			pathNormalizer,
			securityValidator,
			config.sanitize
		);
		const streamProcessor = new TscStreamProcessorImpl(parser, logger);

		return new TypeScriptReporter(
			logger,
			pathNormalizer,
			securityValidator,
			compiler,
			streamProcessor
		);
	}
}
