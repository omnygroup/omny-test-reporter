/**
 * Core diagnostic type representing a single issue found by linters or type checkers
 * @module core/types/diagnostic
 */

/** Severity level of a diagnostic */
export type DiagnosticSeverity = 'error' | 'warning' | 'info' | 'note';

/** Source of the diagnostic (ESLint, TypeScript, Vitest, etc.) */
export type DiagnosticSource = 'eslint' | 'typescript' | 'vitest';

/**
 * Represents a single diagnostic issue
 * Immutable structure for consistency across all diagnostic sources
 */
export interface Diagnostic {
  /** Unique identifier for the diagnostic */
  readonly id: string;

  /** Source tool that generated this diagnostic */
  readonly source: DiagnosticSource;

  /** File path (absolute or relative) where the issue occurs */
  readonly filePath: string;

  /** Line number (1-based) */
  readonly line: number;

  /** Column number (1-based) */
  readonly column: number;

  /** End line for range-based diagnostics */
  readonly endLine?: number;

  /** End column for range-based diagnostics */
  readonly endColumn?: number;

  /** Severity level */
  readonly severity: DiagnosticSeverity;

  /** Rule/error code (e.g., 'no-unused-vars', 'TS2322') */
  readonly code: string;

  /** Human-readable message */
  readonly message: string;

  /** Detailed message (optional) */
  readonly detail?: string;

  /** Suggested fix (optional) */
  readonly fix?: {
    readonly description: string;
    readonly replacement: string;
  };

  /** Timestamp when diagnostic was created */
  readonly timestamp: Date;
}

/** Factory function to create a Diagnostic */
export function createDiagnostic(
  source: DiagnosticSource,
  filePath: string,
  line: number,
  column: number,
  severity: DiagnosticSeverity,
  code: string,
  message: string,
  options?: Partial<Omit<Diagnostic, 'id' | 'source' | 'filePath' | 'line' | 'column' | 'severity' | 'code' | 'message' | 'timestamp'>>
): Diagnostic {
  const id = `${source}:${filePath}:${line}:${column}:${code}`;

  return {
    id,
    source,
    filePath,
    line,
    column,
    severity,
    code,
    message,
    timestamp: new Date(),
    ...options,
  };
}
