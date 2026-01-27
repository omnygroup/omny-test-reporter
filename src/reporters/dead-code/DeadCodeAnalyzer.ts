/**
 * Dead code analyzer orchestrator
 * Combines DI graph analysis with ts-morph reference finding
 * @module reporters/dead-code/DeadCodeAnalyzer
 */

import { injectable, inject } from 'inversify';
import { type SourceFile } from 'ts-morph';

import { TOKENS } from '@/di/tokens.js';
import { DeadCodeCategory, type DeadCodeItem, type ILogger } from '@core';

import { DiGraphBuilder } from './DiGraphBuilder.js';
import { TsMorphProjectLoader } from './TsMorphProjectLoader.js';
import { TsMorphReferenceFinder } from './TsMorphReferenceFinder.js';

/** Symbols to never flag as dead (external hooks, barrel exports, etc.) */
const ALLOWLIST_CLASSES = new Set([
	'VitestAdapter',
	'TaskProcessor',
]);

const ALLOWLIST_FILES = new Set([
	'src/index.ts',
	'src/core/index.ts',
	'src/domain/index.ts',
	'src/infrastructure/index.ts',
	'src/application/index.ts',
	'src/reporters/index.ts',
]);

@injectable()
export class DeadCodeAnalyzer {
	public constructor(
		@inject(TOKENS.PROJECT_LOADER) private readonly projectLoader: TsMorphProjectLoader,
		@inject(TOKENS.DI_GRAPH_BUILDER) private readonly diGraphBuilder: DiGraphBuilder,
		@inject(TOKENS.REFERENCE_FINDER) private readonly referenceFinder: TsMorphReferenceFinder,
		@inject(TOKENS.LOGGER) private readonly logger: ILogger
	) {}

	/**
	 * Run full dead code analysis.
	 */
	public analyze(tsConfigPath: string): DeadCodeItem[] {
		this.logger.info('Starting dead code analysis');

		const project = this.projectLoader.load(tsConfigPath);
		const diGraph = this.diGraphBuilder.build(project);
		const items: DeadCodeItem[] = [];

		// 1. Find unresolved DI tokens (bound but never resolved)
		const unresolvedTokens = this.findUnresolvedTokens(diGraph);
		items.push(...unresolvedTokens);

		// 2. Find phantom tokens (resolved but never bound)
		const phantomTokens = this.findPhantomTokens(diGraph);
		items.push(...phantomTokens);

		// Set of class names bound to unresolved tokens (likely dead)
		const unresolvedClassNames = new Set(
			unresolvedTokens
				.filter((item) => item.detail !== undefined)
				.map((item) => {
					const match = /→\s*(\w+)/.exec(item.detail ?? '');
					return match?.[1];
				})
				.filter((name): name is string => name !== undefined)
		);

		// 3. Find dead classes
		const deadClasses = this.findDeadClasses(project, unresolvedClassNames);
		items.push(...deadClasses);

		// Set of dead class names for filtering methods
		const deadClassNames = new Set(deadClasses.map((item) => item.symbolName));

		// 4. Find dead public methods (on live classes only)
		const deadMethods = this.findDeadMethods(project, deadClassNames);
		items.push(...deadMethods);

		// 5. Find dead interface methods
		const deadInterfaceMethods = this.referenceFinder.getDeadInterfaceMethods(project);
		for (const ref of deadInterfaceMethods) {
			items.push({
				category: DeadCodeCategory.DeadInterfaceMethod,
				symbolName: ref.symbolName,
				filePath: ref.filePath,
				line: ref.line,
				column: ref.column,
			});
		}

		this.logger.info('Dead code analysis completed', { totalFindings: items.length });

		return items;
	}

	private findUnresolvedTokens(diGraph: { bindings: readonly { tokenName: string; className: string; filePath: string; line: number }[]; resolutions: readonly { tokenName: string }[] }): DeadCodeItem[] {
		const resolvedTokens = new Set(diGraph.resolutions.map((r) => r.tokenName));
		const items: DeadCodeItem[] = [];

		for (const binding of diGraph.bindings) {
			// DIAGNOSTIC_INTEGRATION is a multi-inject token, skip it
			if (binding.tokenName === 'DIAGNOSTIC_INTEGRATION') continue;

			if (!resolvedTokens.has(binding.tokenName)) {
				items.push({
					category: DeadCodeCategory.UnresolvedDiToken,
					symbolName: `TOKENS.${binding.tokenName}`,
					filePath: binding.filePath,
					line: binding.line,
					column: 1,
					detail: `TOKENS.${binding.tokenName} → ${binding.className} (bound but never resolved)`,
				});
			}
		}

		return items;
	}

	private findPhantomTokens(diGraph: { bindings: readonly { tokenName: string }[]; resolutions: readonly { tokenName: string; resolvedIn: string; line: number }[] }): DeadCodeItem[] {
		const boundTokens = new Set(diGraph.bindings.map((b) => b.tokenName));
		const items: DeadCodeItem[] = [];
		const seen = new Set<string>();

		for (const resolution of diGraph.resolutions) {
			if (boundTokens.has(resolution.tokenName)) continue;
			if (seen.has(resolution.tokenName)) continue;
			seen.add(resolution.tokenName);

			items.push({
				category: DeadCodeCategory.PhantomToken,
				symbolName: `TOKENS.${resolution.tokenName}`,
				filePath: resolution.resolvedIn,
				line: resolution.line,
				column: 1,
				detail: `TOKENS.${resolution.tokenName} (referenced but never bound)`,
			});
		}

		return items;
	}

	private findDeadClasses(
		project: ReturnType<TsMorphProjectLoader['load']>,
		unresolvedClassNames: Set<string>
	): DeadCodeItem[] {
		const items: DeadCodeItem[] = [];

		for (const sourceFile of project.getSourceFiles()) {
			if (!this.isAnalyzableFile(sourceFile)) continue;

			for (const classDecl of sourceFile.getClasses()) {
				const item = this.checkClassForDeadCode(classDecl, sourceFile, unresolvedClassNames);
				if (item !== undefined) {
					items.push(item);
				}
			}
		}

		return items;
	}

	private checkClassForDeadCode(
		classDecl: ReturnType<SourceFile['getClasses']>[number],
		sourceFile: SourceFile,
		unresolvedClassNames: Set<string>
	): DeadCodeItem | undefined {
		if (!classDecl.isExported()) return undefined;

		const className = classDecl.getName();
		if (className === undefined) return undefined;
		if (ALLOWLIST_CLASSES.has(className)) return undefined;

		const callSiteCount = this.referenceFinder.getClassCallSiteCount(classDecl);
		if (callSiteCount > 0) return undefined;

		const isUnresolvedDiClass = unresolvedClassNames.has(className);

		return {
			category: DeadCodeCategory.DeadClass,
			symbolName: className,
			filePath: sourceFile.getFilePath(),
			line: classDecl.getStartLineNumber(),
			column: 1,
			detail: isUnresolvedDiClass
				? `${className} (bound to unresolved DI token, zero call-sites)`
				: `${className} (zero external call-sites)`,
		};
	}

	private findDeadMethods(
		project: ReturnType<TsMorphProjectLoader['load']>,
		deadClassNames: Set<string>
	): DeadCodeItem[] {
		const items: DeadCodeItem[] = [];

		for (const sourceFile of project.getSourceFiles()) {
			if (!this.isAnalyzableFile(sourceFile)) continue;
			this.collectDeadMethodsFromFile(sourceFile, deadClassNames, items);
		}

		return items;
	}

	private collectDeadMethodsFromFile(
		sourceFile: SourceFile,
		deadClassNames: Set<string>,
		items: DeadCodeItem[]
	): void {
		for (const classDecl of sourceFile.getClasses()) {
			const className = classDecl.getName();
			if (className === undefined) continue;
			if (deadClassNames.has(className)) continue;
			if (ALLOWLIST_CLASSES.has(className)) continue;

			const deadMethods = this.referenceFinder.getDeadPublicMethods(classDecl);
			for (const ref of deadMethods) {
				items.push({
					category: DeadCodeCategory.DeadMethod,
					symbolName: ref.symbolName,
					filePath: ref.filePath,
					line: ref.line,
					column: ref.column,
				});
			}
		}
	}

	private isAnalyzableFile(sourceFile: SourceFile): boolean {
		const filePath = sourceFile.getFilePath();

		// Only analyze src/ files
		if (!filePath.includes('/src/')) return false;

		// Skip node_modules
		if (filePath.includes('node_modules')) return false;

		// Skip barrel/index files (re-exports only)
		const normalizedPath = filePath.replace(/^.*\/src\//, 'src/');
		if (ALLOWLIST_FILES.has(normalizedPath)) return false;

		// Skip DI registration files (they reference classes for binding, not usage)
		if (/\/di\/register\w+\.ts$/.test(filePath)) return false;

		return true;
	}
}
