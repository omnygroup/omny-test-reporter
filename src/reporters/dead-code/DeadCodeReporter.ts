/**
 * Dead code diagnostic integration
 * Extends BaseReportGenerator to integrate with the diagnostic pipeline
 * @module reporters/dead-code/DeadCodeReporter
 */

import { injectable, inject } from 'inversify';

import { TOKENS } from '@/di/tokens.js';
import {
	BaseReportGenerator,
	IntegrationName,
	DiagnosticError,
	type Diagnostic,
	type Result,
	type ILogger,
} from '@core';

import { DeadCodeAnalyzer } from './DeadCodeAnalyzer.js';
import { DeadCodeDiagnosticResult } from './DeadCodeDiagnosticResult.js';

import type { CollectionConfig } from '@domain';

@injectable()
export class DeadCodeReporter extends BaseReportGenerator {
	public constructor(
		@inject(TOKENS.LOGGER) logger: ILogger,
		@inject(TOKENS.DEAD_CODE_ANALYZER) private readonly analyzer: DeadCodeAnalyzer
	) {
		super(logger);
	}

	protected getIntegrationName(): IntegrationName {
		return IntegrationName.DeadCode;
	}

	protected async collectDiagnostics(
		config: CollectionConfig
	): Promise<Result<readonly Diagnostic[], DiagnosticError>> {
		return this.runReporter(async () => {
			const tsConfigPath = config.configPath ?? 'tsconfig.json';
			const items = await Promise.resolve(this.analyzer.analyze(tsConfigPath));

			return items.map((item) => new DeadCodeDiagnosticResult(item).diagnostic);
		}, 'Dead code analysis failed');
	}
}
