/** @type {import("prettier").Config} */
module.exports = {
  semi: false,
  singleQuote: true,
  trailingComma: 'none',
  bracketSpacing: false,
  arrowParens: 'avoid',
  overrides: [
    {
      files: ['.devcontainer/**/*.json'],
      options: {
        useTabs: true,
        tabWidth: 4
      }
    }
  ]
}
