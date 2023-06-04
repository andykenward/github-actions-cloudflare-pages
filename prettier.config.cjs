/** @type {import("@ianvs/prettier-plugin-sort-imports").PrettierConfig} */
const config = {
  plugins: [require.resolve('@ianvs/prettier-plugin-sort-imports')],
  importOrder: [
    '', // If you want a gap at the top after top-of-file-comments, put a separator here!
    '<BUILTIN_MODULES>',
    '',
    '<THIRD_PARTY_MODULES>',
    '',
    '^@app/(.*)$',
    '',
    '@/(.*)$',
    '^[./]'
  ],
  importOrderTypeScriptVersion: '5.0.0',
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
    },
    {
      files: ['*.ts'],
      options: {
        parser: 'typescript'
      }
    }
  ]
}

module.exports = config
