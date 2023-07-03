// @ts-check

/** @type {import('@graphql-codegen/cli').CodegenConfig } */
const config = {
  overwrite: true,
  schema: './node_modules/@octokit/graphql-schema/schema.graphql',
  documents: ['./src/**/*.{graphql,js,ts}', './bin/**/*.{graphql,js,ts}'],
  emitLegacyCommonJSImports: false,
  generates: {
    '__generated__/gql/': {
      preset: 'client',
      config: {
        useTypeImports: true,
        immutableTypes: true,
        dedupeFragments: true,
        useExplicitTyping: true,
        skipTypename: true,
        documentMode: 'string'
        // flattenGeneratedTypes: true
      },
      presetConfig: {
        fragmentMasking: false
      }
    }
  }
}

export default config
