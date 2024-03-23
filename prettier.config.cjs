/** @type {import("@ianvs/prettier-plugin-sort-imports").PrettierConfig} */
const config = {
  plugins: [
    require.resolve('@ianvs/prettier-plugin-sort-imports'),
    'prettier-plugin-packagejson'
  ],
  importOrder: [
    '',
    '<TYPES>',
    '',
    '<BUILTIN_MODULES>',
    '',
    '<THIRD_PARTY_MODULES>',
    '',
    '<TYPES>^(@api|@app|@assets|@ui)(/.*)$',
    '',
    '^(@api|@app|@assets|@ui)(/.*)$',
    '',
    '<TYPES>@/(.*)$',
    '',
    '@/(.*)$',
    '',
    '<TYPES>^[./]',
    '',
    '^[./]'
  ],
  importOrderTypeScriptVersion: '5.1.3',
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
