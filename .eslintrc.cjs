// @ts-check

/** @type {import("eslint").Linter.Config} */
const config = {
  root: true,
  env: {
    es2021: true,
    node: true
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:unicorn/all',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname
  },
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
        'unicorn/no-null': 'off',
        '@typescript-eslint/unbound-method': 'off'
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
    },
    {
      files: ['__fixtures__/**'],
      rules: {
        'unicorn/no-null': 'off',
        'unicorn/numeric-separators-style': 'off'
      }
    }
  ],
  rules: {
    '@typescript-eslint/consistent-type-imports': 'error',
    'unicorn/prefer-top-level-await': 'off',
    'unicorn/prevent-abbreviations': 'off',
    'no-console': 'error'
  }
}

module.exports = config
