import { globalIgnores } from 'eslint/config';

// ESLint config for packages directory
const eslintConfig = [
  // Ignore files
  globalIgnores([
    'node_modules/**',
    '.next/**',
    'out/**',
    'build/**',
    'dist/**',
    'coverage/**',
    '*.min.js',
    '*.min.css',
    'vendor/**',
    '*.md',
    // Ignore apps as they have their own configs
    'apps/**',
    // Ignore mock directory
    'mock/**',
  ]),
];

export default eslintConfig;
