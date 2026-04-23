import tseslint from 'typescript-eslint';

export default tseslint.config({
  files: ['**/*.ts'],
  ignores: ['node_modules', 'playwright-report', 'test-results', 'dist'],
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json'
    }
  },
  rules: {
    '@typescript-eslint/no-floating-promises': 'error'
  }
});
