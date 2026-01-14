/**
 * Security module barrel export
 * @module infrastructure/security
 */

export type { ISanitizer } from '../../core/index.js';

export { RedactSanitizer } from './RedactSanitizer.js';
export { PathValidator } from './PathValidator.js';
