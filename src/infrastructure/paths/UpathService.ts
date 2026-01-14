/**
 * Unified path service using upath
 * @module infrastructure/paths/UpathService
 */

import { join, dirname, basename, extname, relative, resolve, isAbsolute, normalize } from 'upath';

import type { IPathService } from '../../core/index.js';

/**
 * Path service implementation using upath
 * Provides cross-platform path handling with consistent forward slashes
 */
export class UpathService implements IPathService {
  public normalize(path: string): string {
    return normalize(path);
  }

  public join(...segments: string[]): string {
    return join(...segments);
  }

  public dirname(path: string): string {
    return dirname(path);
  }

  public basename(path: string, ext?: string): string {
    return basename(path, ext);
  }

  public extname(path: string): string {
    return extname(path);
  }

  public isAbsolute(path: string): boolean {
    return isAbsolute(path);
  }

  public relative(from: string, to: string): string {
    return relative(from, to);
  }

  public resolve(...segments: string[]): string {
    return resolve(...segments);
  }
}
