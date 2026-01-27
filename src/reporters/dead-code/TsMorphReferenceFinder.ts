/**
 * Reference finder — wraps ts-morph findReferences with call-site filtering
 * @module reporters/dead-code/TsMorphReferenceFinder
 */

import { injectable } from 'inversify';
import {
	SyntaxKind,
	type Project,
	type ClassDeclaration,
	type MethodDeclaration,
	type SourceFile,
	type Node,
} from 'ts-morph';

export interface ReferenceResult {
	readonly symbolName: string;
	readonly filePath: string;
	readonly line: number;
	readonly column: number;
	readonly callSiteCount: number;
}

@injectable()
export class TsMorphReferenceFinder {
	/**
	 * Check if an exported class has any real call-sites (beyond definitions, type-only refs, and re-exports).
	 */
	public getClassCallSiteCount(classDecl: ClassDeclaration): number {
		const nameNode = classDecl.getNameNode();
		if (nameNode === undefined) return 0;

		const references = nameNode.findReferencesAsNodes();
		return this.countCallSites(references, classDecl.getSourceFile());
	}

	/**
	 * Get call-site count for each public method on a class.
	 */
	public getDeadPublicMethods(classDecl: ClassDeclaration): ReferenceResult[] {
		const deadMethods: ReferenceResult[] = [];
		const methods = classDecl.getMethods().filter((m) => !m.hasModifier(SyntaxKind.PrivateKeyword));

		for (const method of methods) {
			if (this.isAbstractOverride(method)) continue;
			if (this.isInterfaceImplementation(method)) continue;

			const references = method.findReferencesAsNodes();
			const callSites = this.countCallSites(references, method.getSourceFile());

			if (callSites === 0) {
				deadMethods.push({
					symbolName: `${classDecl.getName() ?? 'unknown'}.${method.getName()}`,
					filePath: method.getSourceFile().getFilePath(),
					line: method.getStartLineNumber(),
					column: method.getStart() - method.getStartLinePos() + 1,
					callSiteCount: 0,
				});
			}
		}

		return deadMethods;
	}

	/**
	 * Find exported functions with zero call-sites.
	 */
	public getDeadExportedFunctions(sourceFile: SourceFile): ReferenceResult[] {
		const deadFunctions: ReferenceResult[] = [];
		const functions = sourceFile.getFunctions().filter((f) => f.isExported());

		for (const func of functions) {
			const nameNode = func.getNameNode();
			if (nameNode === undefined) continue;

			const references = nameNode.findReferencesAsNodes();
			const callSites = this.countCallSites(references, sourceFile);

			if (callSites === 0) {
				deadFunctions.push({
					symbolName: func.getName() ?? 'anonymous',
					filePath: sourceFile.getFilePath(),
					line: func.getStartLineNumber(),
					column: func.getStart() - func.getStartLinePos() + 1,
					callSiteCount: 0,
				});
			}
		}

		return deadFunctions;
	}

	/**
	 * Find interface methods that are never called on any implementation.
	 */
	public getDeadInterfaceMethods(project: Project): ReferenceResult[] {
		const deadMethods: ReferenceResult[] = [];

		for (const sourceFile of project.getSourceFiles()) {
			if (!this.isProjectSourceFile(sourceFile)) continue;

			for (const iface of sourceFile.getInterfaces()) {
				if (!iface.isExported()) continue;

				for (const method of iface.getMethods()) {
					const references = method.findReferencesAsNodes();
					const callSites = this.countCallSites(references, sourceFile);

					if (callSites === 0) {
						deadMethods.push({
							symbolName: `${iface.getName()}.${method.getName()}`,
							filePath: sourceFile.getFilePath(),
							line: method.getStartLineNumber(),
							column: method.getStart() - method.getStartLinePos() + 1,
							callSiteCount: 0,
						});
					}
				}
			}
		}

		return deadMethods;
	}

	/**
	 * Filter reference nodes to only real call-sites.
	 * Excludes: the definition itself, type-only references, import declarations, re-exports.
	 */
	private countCallSites(references: Node[], definitionFile: SourceFile): number {
		let count = 0;

		for (const ref of references) {
			const refFile = ref.getSourceFile();

			// Skip test files
			if (refFile.getFilePath().includes('/tests/')) continue;

			// Skip if it's in the same position as definition (self-reference)
			if (refFile === definitionFile && this.isDefinitionSite(ref)) continue;

			// Skip non-call-site references (imports, exports, type refs)
			if (this.isNonCallSiteReference(ref)) continue;

			count++;
		}

		return count;
	}

	/**
	 * Check if a reference is a non-call-site (import, export, or type reference).
	 */
	private isNonCallSiteReference(ref: Node): boolean {
		const parent = ref.getParent();
		if (parent === undefined) return false;

		const parentKind = parent.getKind();

		// Import declarations
		if (
			parentKind === SyntaxKind.ImportSpecifier ||
			parentKind === SyntaxKind.ImportClause ||
			parentKind === SyntaxKind.ImportDeclaration
		) {
			return true;
		}

		// Export declarations (re-exports)
		if (parentKind === SyntaxKind.ExportSpecifier || parentKind === SyntaxKind.ExportDeclaration) {
			return true;
		}

		// Type-only references
		if (parentKind === SyntaxKind.TypeReference || parentKind === SyntaxKind.TypeQuery) {
			return true;
		}

		return false;
	}

	/**
	 * Check if a reference node is at the definition site.
	 */
	private isDefinitionSite(node: Node): boolean {
		const kind = node.getParent()?.getKind();
		if (kind === undefined) return false;

		return (
			kind === SyntaxKind.ClassDeclaration ||
			kind === SyntaxKind.MethodDeclaration ||
			kind === SyntaxKind.FunctionDeclaration ||
			kind === SyntaxKind.InterfaceDeclaration ||
			kind === SyntaxKind.MethodSignature ||
			kind === SyntaxKind.PropertyDeclaration ||
			kind === SyntaxKind.VariableDeclaration
		);
	}

	/**
	 * Check if a method is an abstract override (template method pattern).
	 * These should not be flagged since they are called by the base class.
	 */
	private isAbstractOverride(method: MethodDeclaration): boolean {
		if (!method.hasModifier(SyntaxKind.ProtectedKeyword)) return false;

		const classDecl = method.getParent();
		if (classDecl.getKind() !== SyntaxKind.ClassDeclaration) return false;

		const baseMethod = (classDecl as ClassDeclaration).getBaseClass()?.getMethod(method.getName());
		return baseMethod?.isAbstract() === true;
	}

	/**
	 * Check if a method implements an interface method.
	 * If so, we should check the interface method's call-sites instead.
	 */
	private isInterfaceImplementation(method: MethodDeclaration): boolean {
		const classDecl = method.getParent();
		if (classDecl.getKind() !== SyntaxKind.ClassDeclaration) return false;

		const interfaces = (classDecl as ClassDeclaration).getImplements();
		for (const impl of interfaces) {
			const type = impl.getType();
			const property = type.getProperty(method.getName());
			if (property !== undefined) return true;
		}

		return false;
	}

	/**
	 * Check if a source file belongs to the project src/ (not node_modules or tests).
	 */
	private isProjectSourceFile(sourceFile: SourceFile): boolean {
		const filePath = sourceFile.getFilePath();
		return filePath.includes('/src/') && !filePath.includes('node_modules');
	}
}
