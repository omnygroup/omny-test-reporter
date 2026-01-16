import omnyConfig from '@omnygroup/eslint';

const projectPaths = ['./tsconfig.json', './tsconfig.vite.json', './tsconfig.test.json'];
const configs = Array.isArray(omnyConfig) ? omnyConfig.slice() : [omnyConfig];

for (const cfg of configs) {
  if (!cfg) continue;
  const parser = cfg.languageOptions?.parserOptions;
  if (parser && parser.project === true) {
    parser.project = projectPaths;
  }
}

export default configs;

