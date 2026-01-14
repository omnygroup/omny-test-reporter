/**
 * Type guards for runtime type checking
 * @module core/utils/guards
 */

/**
 * Check if value is Error instance
 * @param value Value to check
 * @returns True if value is Error
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Check if value is string
 * @param value Value to check
 * @returns True if value is string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Check if value is object (but not null or array)
 * @param value Value to check
 * @returns True if value is plain object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Check if value is array
 * @param value Value to check
 * @returns True if value is array
 */
export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Check if value is number
 * @param value Value to check
 * @returns True if value is number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

/**
 * Check if value is boolean
 * @param value Value to check
 * @returns True if value is boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Check if value is null or undefined
 * @param value Value to check
 * @returns True if value is null or undefined
 */
export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Check if value is not null or undefined
 * @param value Value to check
 * @returns True if value is not null or undefined
 */
export function isNotNullish<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
