/**
 * Type definitions for test error reporting system
 * @module test-reporter/types
 */

/**
 * @typedef {Object} VitestTestResult
 * @property {string} name - Test suite file path
 * @property {string} status - Test suite status: 'passed' | 'failed'
 * @property {number} duration - Test suite execution time in ms
 * @property {AssertionResult[]} assertionResults - Individual test results
 */

/**
 * @typedef {Object} AssertionResult
 * @property {string} title - Test name
 * @property {string} fullName - Full test name with suite hierarchy
 * @property {string} status - Test status: 'passed' | 'failed' | 'skipped'
 * @property {number} duration - Test execution time in ms
 * @property {string[]} failureMessages - Array of failure messages
 * @property {TestLocation} [location] - Test location in file
 * @property {number} [retryCount] - Number of retry attempts
 */

/**
 * @typedef {Object} TestLocation
 * @property {string} file - File path
 * @property {number} line - Line number
 * @property {number} column - Column number
 */

/**
 * @typedef {Object} VitestJsonOutput
 * @property {number} numTotalTestSuites - Total test suites count
 * @property {number} numPassedTestSuites - Passed test suites count
 * @property {number} numFailedTestSuites - Failed test suites count
 * @property {number} numTotalTests - Total tests count
 * @property {number} numPassedTests - Passed tests count
 * @property {number} numFailedTests - Failed tests count
 * @property {VitestTestResult[]} testResults - Array of test results
 * @property {number} [startTime] - Test run start timestamp
 * @property {boolean} success - Overall success status
 */

/**
 * @typedef {Object} StackFrame
 * @property {string} file - File path
 * @property {number} line - Line number
 * @property {number} column - Column number
 * @property {string} function - Function name
 * @property {boolean} isProjectFile - Whether this is a project file (not node_modules)
 */

/**
 * @typedef {Object} ConsoleLog
 * @property {string} type - Log type: 'log' | 'error' | 'warn' | 'info' | 'debug'
 * @property {string} message - Log message
 * @property {number} timestamp - Timestamp in milliseconds
 */

/**
 * @typedef {Object} SnapshotDiff
 * @property {string} expected - Expected snapshot value
 * @property {string} received - Received snapshot value
 * @property {string} diff - Diff output
 */

/**
 * @typedef {Object} EnvironmentInfo
 * @property {string} nodeVersion - Node.js version
 * @property {string} vitestVersion - Vitest version
 * @property {string} platform - OS platform
 * @property {string} arch - CPU architecture
 */

/**
 * @typedef {Object} EnrichedTestFailure
 * @property {string} testName - Test name
 * @property {string} fullName - Full test name with suite hierarchy
 * @property {string} status - Test status
 * @property {number} duration - Test execution time in ms
 * @property {number} retryCount - Number of retry attempts
 * @property {string[]} failureMessages - Array of failure messages
 * @property {string} rawStackTrace - Original stack trace as string
 * @property {StackFrame[]} parsedStackTrace - Parsed stack frames
 * @property {TestLocation|null} location - Test location in file
 * @property {SnapshotDiff|null} snapshotDiff - Snapshot diff if applicable
 * @property {ConsoleLog[]} consoleLogs - Console output during test
 * @property {string} contentHash - Hash of test content for change tracking
 */

/**
 * @typedef {Object} TestFileErrorReport
 * @property {string} $schema - JSON Schema reference
 * @property {string} testFile - Test file path (normalized)
 * @property {string} timestamp - ISO 8601 timestamp
 * @property {EnvironmentInfo} environment - Runtime environment info
 * @property {TestFileSummary} summary - Test file statistics
 * @property {EnrichedTestFailure[]} failures - Array of failed tests
 */

/**
 * @typedef {Object} TestFileSummary
 * @property {number} totalTests - Total tests in file
 * @property {number} passedTests - Passed tests count
 * @property {number} failedTests - Failed tests count
 * @property {number} skippedTests - Skipped tests count
 * @property {number} duration - Total duration in ms
 */

/**
 * @typedef {Object} AggregatedErrors
 * @property {Map<string, EnrichedTestFailure[]>} errorsByFile - Errors grouped by test file
 * @property {OverallStatistics} statistics - Overall statistics
 */

/**
 * @typedef {Object} OverallStatistics
 * @property {number} totalTestSuites - Total test suites
 * @property {number} passedTestSuites - Passed test suites
 * @property {number} failedTestSuites - Failed test suites
 * @property {number} totalTests - Total tests
 * @property {number} passedTests - Passed tests
 * @property {number} failedTests - Failed tests
 * @property {number} skippedTests - Skipped tests
 * @property {number} duration - Total duration in ms
 * @property {number} successRate - Success rate percentage
 */

/**
 * @typedef {Object} ExecutionResult
 * @property {string} outputFilePath - Path to temporary JSON output file
 * @property {number} exitCode - Vitest exit code
 * @property {string} stdout - Standard output
 * @property {string} stderr - Standard error output
 */

export {};
