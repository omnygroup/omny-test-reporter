/**
 * Value object: converts DeadCodeItem to Diagnostic
 * @module reporters/dead-code/DeadCodeDiagnosticResult
 */

import { Diagnostic, IntegrationName, DeadCodeCategory, type DeadCodeItem } from '@core';

export class DeadCodeDiagnosticResult {
	public readonly symbolName: string;
	public readonly filePath: string;
	public readonly line: number;
	public readonly column: number;
	public readonly category: DeadCodeCategory;
	public readonly detail: string | undefined;

	public constructor(item: DeadCodeItem) {
		this.symbolName = item.symbolName;
		this.filePath = item.filePath;
		this.line = item.line;
		this.column = item.column;
		this.category = item.category;
		this.detail = item.detail;
	}

	public get diagnostic(): Diagnostic {
		return new Diagnostic({
			integration: IntegrationName.DeadCode,
			filePath: this.filePath,
			line: this.line,
			column: this.column,
			severity: 'warning',
			code: this.category,
			message: this.formatMessage(),
			detail: this.detail,
		});
	}

	private formatMessage(): string {
		switch (this.category) {
			case DeadCodeCategory.UnresolvedDiToken:
				return `Unresolved DI token: ${this.symbolName}`;
			case DeadCodeCategory.DeadClass:
				return `Dead class: ${this.symbolName} has no call-sites`;
			case DeadCodeCategory.DeadMethod:
				return `Dead method: ${this.symbolName}() has no call-sites`;
			case DeadCodeCategory.DeadInterfaceMethod:
				return `Dead interface method: ${this.symbolName}() is never called`;
			case DeadCodeCategory.PhantomToken:
				return `Phantom token: ${this.symbolName} is referenced but never bound`;
		}
	}
}
