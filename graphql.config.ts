import type {CodegenConfig} from '@graphql-codegen/cli'

const config: CodegenConfig = {
  overwrite: true,
  schema: ['./schema/github/schema.graphql'],
  // Operations live in .graphql files only; code imports the generated
  // `…Document` constants from `__generated__/gql/graphql.ts`.
  documents: ['./src/**/*.graphql', './bin/**/*.graphql'],
  emitLegacyCommonJSImports: false,
  generates: {
    '__generated__/gql/': {
      preset: 'client',
      config: {
        enumType: 'native',
        useTypeImports: true,
        immutableTypes: true,
        dedupeFragments: true,
        useExplicitTyping: true,
        skipTypename: true,
        documentMode: 'string',
        // https://docs.github.com/en/graphql/reference/scalars
        scalars: {
          GitObjectID: 'string',
          URI: 'string'
        }
      },
      presetConfig: {
        fragmentMasking: false
      }
    }
  }
}

export default config
