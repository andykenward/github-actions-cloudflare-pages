/** @type {import("@ianvs/prettier-plugin-sort-imports").PrettierConfig} */
const config = {
  plugins: [
    require.resolve('@ianvs/prettier-plugin-sort-imports'),
    require.resolve('prettier-plugin-packagejson')
  ],
  importOrder: [
    '',
    '<TYPES>',
    '',
    '<BUILTIN_MODULES>',
    '',
    '<THIRD_PARTY_MODULES>',
    '',
    '<TYPES>^@/(gql|payloads|responses|tests|types)(/.*)$',
    '',
    '^@/(gql|payloads|responses|tests|types)(/.*)$',
    '',
    '<TYPES>@/(.*)$',
    '',
    '@/(.*)$',
    '',
    '<TYPES>^[./]',
    '',
    '^[./]'
  ],
  importOrderTypeScriptVersion: '5.4.5',
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
    },
    {
      files: ['.github/**/*.{yml,yaml}'],
      options: {
        parser: 'yaml',
        singleQuote: false
      }
    }
  ]
}

module.exports = config
