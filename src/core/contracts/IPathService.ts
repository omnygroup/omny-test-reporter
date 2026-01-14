/**
 * Path service contract
 * @module core/contracts/IPathService
 */

export interface IPathService {
  /**
   * Normalize path for cross-platform compatibility
   * @param path Path to normalize
   * @returns Normalized path with forward slashes
   */
  normalize(path: string): string;

  /**
   * Join path segments
   * @param segments Path segments
   * @returns Joined path
   */
  join(...segments: string[]): string;

  /**
   * Get directory name from path
   * @param path File path
   * @returns Directory name
   */
  dirname(path: string): string;

  /**
   * Get file name from path
   * @param path File path
   * @param ext Extension to remove
   * @returns File name
   */
  basename(path: string, ext?: string): string;

  /**
   * Get file extension
   * @param path File path
   * @returns Extension including dot
   */
  extname(path: string): string;

  /**
   * Check if path is absolute
   * @param path Path to check
   * @returns True if absolute
   */
  isAbsolute(path: string): boolean;

  /**
   * Resolve path relative to another
   * @param from Base path
   * @param to Target path
   * @returns Relative path
   */
  relative(from: string, to: string): string;

  /**
   * Resolve absolute path
   * @param segments Path segments
   * @returns Absolute path
   */
  resolve(...segments: string[]): string;
}
