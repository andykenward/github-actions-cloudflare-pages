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
    'prettier'
  ],
  overrides: [
    {
      files: ['__tests__/**'],
      plugins: ['jest'],
      extends: ['plugin:jest/recommended']
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
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: true,
    tsconfigRootDir: '__dirname'
  },
  plugins: ['@typescript-eslint'],
  rules: {}
}
