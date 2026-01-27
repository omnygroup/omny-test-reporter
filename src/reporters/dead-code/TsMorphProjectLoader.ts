/**
 * ts-morph project loader with caching
 * @module reporters/dead-code/TsMorphProjectLoader
 */

import { injectable, inject } from 'inversify';
import { Project } from 'ts-morph';

import { TOKENS } from '@/di/tokens.js';

import type { ILogger } from '@core';

@injectable()
export class TsMorphProjectLoader {
	private cachedProject: Project | null = null;
	private cachedConfigPath: string | null = null;

	public constructor(@inject(TOKENS.LOGGER) private readonly logger: ILogger) {}

	/**
	 * Load a TypeScript project via ts-morph.
	 * Caches the project instance for the same tsconfig path.
	 */
	public load(tsConfigPath: string): Project {
		if (this.cachedProject !== null && this.cachedConfigPath === tsConfigPath) {
			this.logger.debug('Using cached ts-morph project', { tsConfigPath });
			return this.cachedProject;
		}

		this.logger.info('Loading ts-morph project', { tsConfigPath });

		const project = new Project({
			tsConfigFilePath: tsConfigPath,
			skipAddingFilesFromTsConfig: false,
		});

		this.cachedProject = project;
		this.cachedConfigPath = tsConfigPath;

		const sourceFiles = project.getSourceFiles();
		this.logger.info('ts-morph project loaded', { fileCount: sourceFiles.length });

		return project;
	}
}
