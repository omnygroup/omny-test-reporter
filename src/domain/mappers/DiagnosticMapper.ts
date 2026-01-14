/**
 * Diagnostic mapper
 * @module domain/mappers/DiagnosticMapper
 */

import { BaseMapper, createDiagnostic } from '../../core/index.js';
import type { Diagnostic } from '../../core/index.js';

export interface RawDiagnosticData {
  readonly filePath: string;
  readonly line: number;
  readonly column: number;
  readonly endLine?: number;
  readonly endColumn?: number;
  readonly severity: 'error' | 'warning' | 'info' | 'note';
  readonly code: string;
  readonly message: string;
  readonly detail?: string;
  readonly source: 'eslint' | 'typescript' | 'vitest';
}

/**
 * Maps raw diagnostic data to Diagnostic type
 */
export class DiagnosticMapper extends BaseMapper<RawDiagnosticData, Diagnostic> {
  public map(input: RawDiagnosticData): Diagnostic {
    return createDiagnostic(
      input.source,
      input.filePath,
      input.line,
      input.column,
      input.severity,
      input.code,
      input.message,
      {
        endLine: input.endLine,
        endColumn: input.endColumn,
        detail: input.detail,
      }
    );
  }
}
