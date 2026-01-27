/**
 * Dead code analysis types
 * @module core/types/dead-code
 */

/** Categories of dead code findings */
export enum DeadCodeCategory {
	/** DI token is bound but never resolved via @inject or container.get() */
	UnresolvedDiToken = 'unresolved-di-token',
	/** Class has zero external call-sites */
	DeadClass = 'dead-class',
	/** Public method has zero call-sites */
	DeadMethod = 'dead-method',
	/** Interface method defined but never called on any implementation */
	DeadInterfaceMethod = 'dead-interface-method',
	/** Token referenced in @inject/@optional but never bound in container */
	PhantomToken = 'phantom-token',
}

/** A single dead code finding */
export interface DeadCodeItem {
	readonly category: DeadCodeCategory;
	readonly symbolName: string;
	readonly filePath: string;
	readonly line: number;
	readonly column: number;
	readonly detail?: string;
}

/** A DI container binding: token → class */
export interface DiBinding {
	readonly tokenName: string;
	readonly className: string;
	readonly filePath: string;
	readonly line: number;
}

/** A DI container resolution: where a token is consumed */
export interface DiResolution {
	readonly tokenName: string;
	readonly resolvedIn: string;
	readonly line: number;
	readonly type: 'inject' | 'multiInject' | 'containerGet';
}

/** DI graph combining bindings and resolutions */
export interface DiGraph {
	readonly bindings: readonly DiBinding[];
	readonly resolutions: readonly DiResolution[];
}
