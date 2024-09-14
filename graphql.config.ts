import type {CodegenConfig} from '@graphql-codegen/cli'

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    './node_modules/@octokit/graphql-schema/schema.graphql',
    './schema/github-preview/schema.graphql'
  ],
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
