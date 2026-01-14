/**
 * Formatter contract for output formatting
 * @module core/contracts/IFormatter
 */

export interface IFormatter<TInput, TOutput = string> {
  /**
   * Format input data to output format
   * @param input Data to format
   * @returns Formatted output
   */
  format(input: TInput): TOutput;
}
