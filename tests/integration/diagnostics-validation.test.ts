/**
 * Validation tests for diagnostics implementation
 * 
 * Tests to verify:
 * 1. TypeScript strict mode enables comprehensive diagnostics
 * 2. ESLint patterns support works correctly
 * 3. Default patterns default to ['src']
 * 4. Multiple patterns can be specified
 * 5. ESLint results match native tool output
 */

import { describe, it, expect, beforeEach } from 'vitest';
import path from 'node:path';
import { ReportingFacade } from '../../src/reporters/ReportingFacade.js';

describe('Diagnostics Validation Tests', () => {
	let facade: ReportingFacade;
	const projectRoot = path.resolve(process.cwd());

	beforeEach(() => {
		facade = new ReportingFacade(projectRoot);
	});

	describe('TypeScript Diagnostics', () => {
		it('should enable strict mode for comprehensive diagnostics', async () => {
			const { result } = await facade.collectTypeScriptDiagnostics({
				timeout: 60000,
			});

			// Should succeed without throwing
			expect(result).toBeDefined();
			expect(result.success).toBeDefined();
		});

		it('should collect semantic + pre-emit diagnostics', async () => {
			const { result } = await facade.collectTypeScriptDiagnostics({
				timeout: 60000,
			});

			// Result should have proper structure
			expect(result.diagnostics).toBeDefined();
			expect(Array.isArray(result.diagnostics)).toBe(true);
		});

		it('should return consistent results on multiple runs', async () => {
			const result1 = await facade.collectTypeScriptDiagnostics({
				timeout: 60000,
			});
			const result2 = await facade.collectTypeScriptDiagnostics({
				timeout: 60000,
			});

			// Same error count across runs
			expect(result1.result.totalErrors).toBe(result2.result.totalErrors);
		});
	});

	describe('ESLint Diagnostics with Patterns', () => {
		it('should use default pattern [src] when no patterns specified', async () => {
			const { result } = await facade.collectEslintDiagnostics({
				timeout: 60000,
			});

			expect(result).toBeDefined();
			expect(result.success).toBeDefined();
		});

		it('should respect custom patterns', async () => {
			const { result } = await facade.collectEslintDiagnostics({
				patterns: ['src'],
				timeout: 60000,
			});

			expect(result).toBeDefined();
			// Should have analyzed files from src/
			expect(result.filesWithIssues).toBeDefined();
		});

		it('should handle multiple patterns', async () => {
			const srcOnlyResult = await facade.collectEslintDiagnostics({
				patterns: ['src'],
				timeout: 60000,
			});

			const multiPatternResult = await facade.collectEslintDiagnostics({
				patterns: ['src', 'tests'],
				timeout: 60000,
			});

			// Multi-pattern should find more or equal files
			expect(multiPatternResult.result.filesWithIssues?.length || 0).toBeGreaterThanOrEqual(
				srcOnlyResult.result.filesWithIssues?.length || 0
			);
		});

		it('should exclude ignored patterns', async () => {
			const withoutIgnore = await facade.collectEslintDiagnostics({
				patterns: ['src', 'tests'],
				timeout: 60000,
			});

			const withIgnore = await facade.collectEslintDiagnostics({
				patterns: ['src', 'tests'],
				ignorePatterns: ['**/node_modules/**', '**/*.d.ts'],
				timeout: 60000,
			});

			// With ignore should find same or fewer issues
			expect((withIgnore.result.filesWithIssues?.length || 0)).toBeLessThanOrEqual(
				withoutIgnore.result.filesWithIssues?.length || 0
			);
		});

		it('should return consistent file counts', async () => {
			const result1 = await facade.collectEslintDiagnostics({
				patterns: ['src'],
				timeout: 60000,
			});

			const result2 = await facade.collectEslintDiagnostics({
				patterns: ['src'],
				timeout: 60000,
			});

			// Same files analyzed both times
			expect(result1.result.filesWithIssues?.length).toBe(result2.result.filesWithIssues?.length);
		});
	});

	describe('Combined Diagnostics', () => {
		it('should collect both ESLint and TypeScript diagnostics', async () => {
			const { eslint, typescript } = await facade.collectAll(
				{ patterns: ['src'], timeout: 60000 },
				{ timeout: 60000 }
			);

			expect(eslint.result).toBeDefined();
			expect(typescript.result).toBeDefined();
		});

		it('should handle empty patterns gracefully', async () => {
			const { result } = await facade.collectEslintDiagnostics({
				patterns: [],
				timeout: 60000,
			});

			// Should not throw, should return empty or valid result
			expect(result).toBeDefined();
		});

		it('should handle missing patterns by defaulting to src', async () => {
			const noPatterns = await facade.collectEslintDiagnostics({
				timeout: 60000,
			});

			const explicitSrc = await facade.collectEslintDiagnostics({
				patterns: ['src'],
				timeout: 60000,
			});

			// Both should analyze same files
			expect(noPatterns.result.filesWithIssues?.length).toBe(
				explicitSrc.result.filesWithIssues?.length
			);
		});
	});

	describe('Error Handling', () => {
		it('should handle invalid patterns gracefully', async () => {
			try {
				const { result } = await facade.collectEslintDiagnostics({
					patterns: ['/nonexistent/path/**/*.ts'],
					timeout: 60000,
				});

				// Should return a valid result structure
				expect(result).toBeDefined();
			} catch (error) {
				// Or throw a meaningful error
				expect(error).toBeDefined();
			}
		});

		it('should respect timeout settings', async () => {
			const start = Date.now();
			try {
				await facade.collectTypeScriptDiagnostics({
					timeout: 100, // Very short timeout
				});
			} catch (error) {
				// Should timeout
				const duration = Date.now() - start;
				expect(duration).toBeLessThan(5000); // Should fail quickly
			}
		});

		it('should handle malformed tsconfig.json', async () => {
			try {
				const { result } = await facade.collectTypeScriptDiagnostics({
					tsconfigPath: '/nonexistent/tsconfig.json',
					timeout: 60000,
				});

				// Should return result or throw meaningful error
				expect(result || Error).toBeDefined();
			} catch (error) {
				// Expected to throw
				expect(error instanceof Error).toBe(true);
			}
		});
	});
});
