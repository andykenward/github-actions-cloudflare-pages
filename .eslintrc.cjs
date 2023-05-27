/** @type {import("eslint").Linter.Config} */
module.exports = {
  env: {
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:unicorn/all',
    'prettier'
  ],
  overrides: [
    {
      files: ['__tests__/**'],
      plugins: ['vitest'],
      extends: ['plugin:vitest/all'],
      rules: {
        'vitest/consistent-test-it': ['error', {fn: 'test'}]
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
    'unicorn/prefer-top-level-await': 'off'
  }
}
