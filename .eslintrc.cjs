// @ts-check

/** @type {import("eslint").Linter.Config} */
const config = {
  root: true,
  env: {
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    // 'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:unicorn/all',
    'prettier'
  ],
  overrides: [
    {
      files: ['*.test.ts'],
      plugins: ['vitest'],
      extends: ['plugin:vitest/all'],
      rules: {
        'vitest/consistent-test-it': ['error', {fn: 'test'}],
        'vitest/no-hooks': [
          'error',
          {allow: ['afterEach', 'beforeEach', 'afterAll']}
        ],
        'vitest/max-expects': 'off',
        'vitest/no-mocks-import': 'off',
        'unicorn/numeric-separators-style': 'off',
        'unicorn/no-null': 'off'
      }
    },
    {
      env: {
        commonjs: true
      },
      files: ['*.cjs'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off'
      }
    }
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    project: true,
    tsconfigRootDir: '__dirname'
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'unicorn/prefer-top-level-await': 'off',
    'unicorn/prevent-abbreviations': 'off',
    'no-console': 'error'
  }
}

module.exports = config
