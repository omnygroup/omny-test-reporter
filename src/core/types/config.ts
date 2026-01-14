/**
 * Configuration types
 * @module core/types/config
 */

/** Base configuration interface */
export interface BaseConfig {
  readonly rootPath: string;
  readonly cache?: boolean;
  readonly timeout?: number;
}

/** Collection configuration for diagnostics */
export interface CollectionConfig extends BaseConfig {
  readonly patterns: readonly string[];
  readonly concurrency?: number;
  readonly configPath?: string;
  readonly ignorePatterns?: readonly string[];
}

/** Options for file operations */
export interface WriteOptions {
  readonly atomic?: boolean;
  readonly ensureDir?: boolean;
  readonly overwrite?: boolean;
}

/** Statistics about write operations */
export interface WriteStats {
  readonly filesWritten: number;
  readonly bytesWritten: number;
  readonly duration: number;
  readonly timestamp: Date;
}
