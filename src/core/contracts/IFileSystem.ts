/**
 * File system contract
 * @module core/contracts/IFileSystem
 */

import type { WriteStats, WriteOptions } from '../types/index.js';

export interface IFileSystem {
  /**
   * Check if file or directory exists
   * @param path File or directory path
   * @returns True if exists
   */
  exists(path: string): Promise<boolean>;

  /**
   * Read file contents as string
   * @param path File path
   * @returns File contents
   */
  readFile(path: string): Promise<string>;

  /**
   * Read file contents as Buffer
   * @param path File path
   * @returns Buffer contents
   */
  readFileBuffer(path: string): Promise<Buffer>;

  /**
   * Write file with automatic parent directory creation
   * @param path File path
   * @param data File contents
   * @param options Write options
   * @returns Write statistics
   */
  writeFile(path: string, data: string | Buffer, options?: WriteOptions): Promise<WriteStats>;

  /**
   * Write JSON file atomically
   * @param path File path
   * @param data Object to write
   * @param options Write options
   * @returns Write statistics
   */
  writeJson(path: string, data: unknown, options?: WriteOptions): Promise<WriteStats>;

  /**
   * Ensure directory exists (create if needed)
   * @param path Directory path
   */
  ensureDir(path: string): Promise<void>;

  /**
   * Remove file
   * @param path File path
   */
  removeFile(path: string): Promise<void>;

  /**
   * Remove directory recursively
   * @param path Directory path
   */
  removeDir(path: string): Promise<void>;

  /**
   * List directory contents
   * @param path Directory path
   * @returns Array of file/directory names
   */
  readDir(path: string): Promise<string[]>;

  /**
   * Get absolute file path
   * @param path Relative or absolute path
   * @returns Absolute path
   */
  resolvePath(path: string): string;
}
