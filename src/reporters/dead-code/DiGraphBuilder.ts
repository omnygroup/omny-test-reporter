/**
 * DI graph builder — parses Inversify container registrations and injections
 * @module reporters/dead-code/DiGraphBuilder
 */

import { injectable, inject } from 'inversify';
import { SyntaxKind, type Project, type SourceFile, type CallExpression } from 'ts-morph';

import { TOKENS } from '@/di/tokens.js';

import type { DiBinding, DiGraph, DiResolution, ILogger } from '@core';

@injectable()
export class DiGraphBuilder {
	public constructor(@inject(TOKENS.LOGGER) private readonly logger: ILogger) {}

	/**
	 * Build a DI graph by analyzing container.bind().to() calls and @inject/@multiInject decorators.
	 */
	public build(project: Project): DiGraph {
		const bindings = this.extractBindings(project);
		const resolutions = this.extractResolutions(project);

		this.logger.info('DI graph built', {
			bindings: bindings.length,
			resolutions: resolutions.length,
		});

		return { bindings, resolutions };
	}

	/**
	 * Extract container.bind(TOKEN).to(Class) patterns from register*.ts files.
	 */
	private extractBindings(project: Project): DiBinding[] {
		const bindings: DiBinding[] = [];
		const registerFiles = project.getSourceFiles().filter((sf) => /register\w+\.ts$/.test(sf.getFilePath()));

		for (const sourceFile of registerFiles) {
			const calls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);

			for (const call of calls) {
				const binding = this.parseBindToCall(call, sourceFile);
				if (binding !== undefined) {
					bindings.push(binding);
				}
			}
		}

		return bindings;
	}

	/**
	 * Parse a chain like container.bind(TOKENS.X).to(ClassName)
	 * Returns the token name and class name if matched.
	 */
	private parseBindToCall(call: CallExpression, sourceFile: SourceFile): DiBinding | undefined {
		const callText = call.getText();

		// Match .to(ClassName) at the end of a chain
		const toMatch = /\.to\((\w+)\)/.exec(callText);
		if (toMatch === null) return undefined;

		// Match TOKENS.X in the bind() call
		const tokenMatch = /TOKENS\.(\w+)/.exec(callText);
		if (tokenMatch === null) return undefined;

		const className = toMatch[1];
		const tokenName = tokenMatch[1];

		if (className === undefined || tokenName === undefined) return undefined;

		return {
			tokenName,
			className,
			filePath: sourceFile.getFilePath(),
			line: call.getStartLineNumber(),
		};
	}

	/**
	 * Extract @inject(TOKENS.X), @multiInject(TOKENS.X), and container.get(TOKENS.X)
	 */
	private extractResolutions(project: Project): DiResolution[] {
		const resolutions: DiResolution[] = [];

		for (const sourceFile of project.getSourceFiles()) {
			const filePath = sourceFile.getFilePath();
			const text = sourceFile.getFullText();

			// Find @inject(TOKENS.X) decorators
			this.findDecoratorResolutions(text, filePath, 'inject', resolutions);

			// Find @multiInject(TOKENS.X) decorators
			this.findDecoratorResolutions(text, filePath, 'multiInject', resolutions);

			// Find container.get(TOKENS.X) calls
			this.findContainerGetResolutions(text, filePath, resolutions);
		}

		return resolutions;
	}

	private findDecoratorResolutions(
		text: string,
		filePath: string,
		decoratorName: string,
		resolutions: DiResolution[]
	): void {
		const regex = new RegExp(`@${decoratorName}\\(TOKENS\\.(\\w+)\\)`, 'g');
		let match: RegExpExecArray | null = regex.exec(text);

		while (match !== null) {
			const tokenName = match[1];
			if (tokenName !== undefined) {
				const line = this.getLineNumber(text, match.index);
				resolutions.push({
					tokenName,
					resolvedIn: filePath,
					line,
					type: decoratorName === 'multiInject' ? 'multiInject' : 'inject',
				});
			}
			match = regex.exec(text);
		}
	}

	private findContainerGetResolutions(text: string, filePath: string, resolutions: DiResolution[]): void {
		const regex = /container\.get[<(].*?TOKENS\.(\w+)/g;
		let match: RegExpExecArray | null = regex.exec(text);

		while (match !== null) {
			const tokenName = match[1];
			if (tokenName !== undefined) {
				const line = this.getLineNumber(text, match.index);
				resolutions.push({
					tokenName,
					resolvedIn: filePath,
					line,
					type: 'containerGet',
				});
			}
			match = regex.exec(text);
		}
	}

	private getLineNumber(text: string, index: number): number {
		const upToIndex = text.slice(0, index);
		return upToIndex.split('\n').length;
	}
}
