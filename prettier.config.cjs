/** @type {import("prettier").Config} */
const config = {
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

module.exports = config
