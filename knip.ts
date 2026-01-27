import type { KnipConfig } from 'knip';

const config: KnipConfig = {
	entry: [
		'src/view/cli/App.ts',
		'src/index.ts',
		'src/di/container.ts',
		'src/di/register*.ts',
		'src/reporters/vitest/VitestAdapter.ts',
		'app.js',
	],
	project: ['src/**/*.ts'],
	ignore: ['tests/**/*.ts'],
	ignoreDependencies: ['@omnygroup/eslint', 'pino-pretty'],
	ignoreExportsUsedInFile: { interface: true, type: true },
	includeEntryExports: true,
	include: ['classMembers'],
};

export default config;
