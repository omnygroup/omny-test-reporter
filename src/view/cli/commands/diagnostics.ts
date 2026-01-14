/**
 * Diagnostics CLI command
 * @module view/cli/commands/diagnostics
 */

import type { Arguments, CommandBuilder } from 'yargs';

export interface DiagnosticsOptions extends Arguments {
  patterns?: string[];
  eslint: boolean;
  typescript: boolean;
  format: 'json' | 'pretty' | 'table';
  output?: string;
  help: boolean;
}

export const command = 'diagnostics [patterns..]';
export const describe = 'Collect diagnostics from ESLint and TypeScript';

export const builder: CommandBuilder<unknown, DiagnosticsOptions> = (yargs) => {
  return yargs
    .positional('patterns', {
      describe: 'Glob patterns for files to check',
      type: 'string',
      array: true,
      default: ['src/**/*.ts', 'src/**/*.tsx'],
    })
    .option('eslint', {
      describe: 'Run ESLint',
      type: 'boolean',
      default: true,
    })
    .option('typescript', {
      describe: 'Run TypeScript type checking',
      type: 'boolean',
      default: true,
    })
    .option('format', {
      describe: 'Output format',
      type: 'string',
      choices: ['json', 'pretty', 'table'],
      default: 'pretty',
    })
    .option('output', {
      describe: 'Output file path',
      type: 'string',
      alias: 'o',
    });
};

export async function handler(argv: DiagnosticsOptions): Promise<void> {
  // This is a placeholder - will be implemented in the full application setup
  console.log('Diagnostics command handler would run here');
  console.log({
    patterns: argv.patterns,
    eslint: argv.eslint,
    typescript: argv.typescript,
    format: argv.format,
    output: argv.output,
  });
}
