/**
 * Main CLI application using yargs
 * @module view/cli/App
 */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { diagnosticsCommand } from './commands/index.js';

/**
 * Build and configure the CLI application
 * @returns Configured yargs instance
 */
export function createCliApp() {
  let app = yargs(hideBin(process.argv))
    .command(
      diagnosticsCommand.command,
      diagnosticsCommand.describe,
      diagnosticsCommand.builder,
      diagnosticsCommand.handler
    )
    .option('verbose', {
      alias: 'v',
      describe: 'Enable verbose logging',
      type: 'boolean',
      default: false,
    })
    .option('quiet', {
      alias: 'q',
      describe: 'Suppress non-error output',
      type: 'boolean',
      default: false,
    })
    .help()
    .alias('help', 'h')
    .version(false)
    .strict()
    .wrap(Math.min(120, yargs.terminalWidth()));

  return app;
}

/**
 * Run the CLI application
 */
export async function runCli(): Promise<void> {
  const app = createCliApp();
  await app.argv;
}
