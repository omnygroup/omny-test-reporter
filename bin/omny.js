#!/usr/bin/env node
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const cmd = args[0];

function printHelp() {
	console.log('omny — OmnyFlow developer tools');
	console.log('\nUsage:');
	console.log('  omny reporter    Run the test error reporter');
	console.log('\nExamples:');
	console.log('  omny reporter');
}

if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
	printHelp();
	process.exit(0);
}

if (args.includes('reporter')) {
	// Load and run the package-local parse-tests.mjs
	const reporterPath = path.join(__dirname, '..', 'parse-tests.mjs');
	try {
		const reporterUrl = pathToFileURL(reporterPath).href;
		await import(reporterUrl);
	} catch (err) {
		console.error('Failed to start reporter:', err);
		process.exit(2);
	}
	process.exit(0);
}

console.error(`Unknown command: ${cmd || args.join(' ')}`);
printHelp();
process.exit(2);
