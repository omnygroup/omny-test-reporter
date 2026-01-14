/**
 * Diagnostic source contract
 * @module core/contracts/IDiagnosticSource
 */

import type { Diagnostic, Result } from '../types/index.js';
import type { CollectionConfig } from '../../domain/index.js';

export interface IDiagnosticSource {
  /**
   * Collect diagnostics from source
   * @param config Collection configuration
   * @returns Result with diagnostics or error
   */
  collect(config: CollectionConfig): Promise<Result<readonly Diagnostic[], Error>>;

  /**
   * Get name of the diagnostic source
   * @returns Source name
   */
  getName(): string;
}
