import { PathNormalizer } from './PathNormalizer.mjs';

export class ErrorAggregator {
	#pathNormalizer;

	constructor() {
		this.#pathNormalizer = new PathNormalizer();
	}

	aggregate(enrichedResults, originalResults) {
		console.log('📊 Aggregating test errors by file...');

		const errorsByFile = new Map();

		for (const result of enrichedResults) {
			const normalizedPath = this.#pathNormalizer.normalize(result.testFile);

			if (!errorsByFile.has(normalizedPath)) {
				errorsByFile.set(normalizedPath, []);
			}

			errorsByFile.get(normalizedPath).push(...result.failures);
		}

		for (const [file, failures] of errorsByFile.entries()) {
			failures.sort((a, b) => b.duration - a.duration);
		}

		const statistics = this.#computeStatistics(originalResults, errorsByFile);

		console.log(`✅ Aggregated ${statistics.failedTests} failures across ${errorsByFile.size} files`);

		return {
			errorsByFile,
			statistics,
		};
	}

	#computeStatistics(results, errorsByFile) {
		const duration = results.testResults.reduce((sum, suite) => sum + (suite.duration || 0), 0);

		const skippedTests = Math.max(0, results.numTotalTests - results.numPassedTests - results.numFailedTests);

		const successRate = results.numTotalTests > 0 ? (results.numPassedTests / results.numTotalTests) * 100 : 0;

		return {
			totalTestSuites: results.numTotalTestSuites,
			passedTestSuites: results.numPassedTestSuites,
			failedTestSuites: results.numFailedTestSuites,
			totalTests: results.numTotalTests,
			passedTests: results.numPassedTests,
			failedTests: results.numFailedTests,
			skippedTests,
			duration: Math.round(duration),
			successRate: Math.round(successRate * 100) / 100,
		};
	}

	getSlowestFailures(errorsByFile, limit = 5) {
		const allFailures = [];

		for (const [file, failures] of errorsByFile.entries()) {
			for (const failure of failures) {
				allFailures.push({ file, failure });
			}
		}

		allFailures.sort((a, b) => b.failure.duration - a.failure.duration);

		return allFailures.slice(0, limit);
	}

	groupByErrorType(errorsByFile) {
		const errorTypes = new Map();

		for (const failures of errorsByFile.values()) {
			for (const failure of failures) {
				const errorType = this.#detectErrorType(failure);

				if (!errorTypes.has(errorType)) {
					errorTypes.set(errorType, 0);
				}

				errorTypes.set(errorType, errorTypes.get(errorType) + 1);
			}
		}

		return errorTypes;
	}

	#detectErrorType(failure) {
		const allMessages = failure.failureMessages.join(' ').toLowerCase();

		if (allMessages.includes('timeout') || allMessages.includes('timed out')) {
			return 'Timeout Error';
		}

		if (
			allMessages.includes('assertion') ||
			allMessages.includes('expected') ||
			allMessages.includes('tobe') ||
			allMessages.includes('toequal')
		) {
			return 'Assertion Error';
		}

		if (allMessages.includes('unhandled') || allMessages.includes('rejection') || allMessages.includes('promise')) {
			return 'Unhandled Rejection';
		}

		if (allMessages.includes('syntax') || allMessages.includes('unexpected token')) {
			return 'Syntax Error';
		}

		if (allMessages.includes('network') || allMessages.includes('fetch')) {
			return 'Network Error';
		}

		if (allMessages.includes('mock') || allMessages.includes('spy')) {
			return 'Mock/Spy Error';
		}

		if (failure.snapshotDiff) {
			return 'Snapshot Mismatch';
		}

		return 'Other Error';
	}

	getTopFailedFiles(errorsByFile, limit = 5) {
		const fileCounts = [];

		for (const [file, failures] of errorsByFile.entries()) {
			fileCounts.push({ file, count: failures.length });
		}

		fileCounts.sort((a, b) => b.count - a.count);

		return fileCounts.slice(0, limit);
	}
}
