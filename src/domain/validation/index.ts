/**
 * Validation module barrel export
 * @module domain/validation
 */

export { ConfigValidator } from './ConfigValidator.js';
export {
  CollectionConfigSchema,
  ReportingConfigSchema,
  type CollectionConfig,
  type ReportingConfig,
} from './schemas/index.js';
