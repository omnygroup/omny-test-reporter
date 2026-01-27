/**
 * Dead code analysis services registration
 * @module di/registerDeadCode
 */

import { DeadCodeAnalyzer } from '../reporters/dead-code/DeadCodeAnalyzer.js';
import { DiGraphBuilder } from '../reporters/dead-code/DiGraphBuilder.js';
import { TsMorphProjectLoader } from '../reporters/dead-code/TsMorphProjectLoader.js';
import { TsMorphReferenceFinder } from '../reporters/dead-code/TsMorphReferenceFinder.js';

import { TOKENS } from './tokens.js';

import type { Container } from 'inversify';

export function registerDeadCode(container: Container): void {
	container.bind(TOKENS.PROJECT_LOADER).to(TsMorphProjectLoader).inSingletonScope();
	container.bind(TOKENS.DI_GRAPH_BUILDER).to(DiGraphBuilder).inTransientScope();
	container.bind(TOKENS.REFERENCE_FINDER).to(TsMorphReferenceFinder).inTransientScope();
	container.bind(TOKENS.DEAD_CODE_ANALYZER).to(DeadCodeAnalyzer).inTransientScope();
}
