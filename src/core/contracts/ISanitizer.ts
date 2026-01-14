/**
 * Sanitizer contract for sensitive data
 * @module core/contracts/ISanitizer
 */

export interface ISanitizer {
  /**
   * Sanitize message by removing or masking sensitive data
   * @param message Message to sanitize
   * @returns Sanitized message
   */
  sanitizeMessage(message: string): string;

  /**
   * Sanitize path by removing or masking sensitive information
   * @param path Path to sanitize
   * @returns Sanitized path
   */
  sanitizePath(path: string): string;

  /**
   * Sanitize object by applying sanitization to all values
   * @param obj Object to sanitize
   * @returns Sanitized object
   */
  sanitizeObject<T extends Record<string, unknown>>(obj: T): T;
}
