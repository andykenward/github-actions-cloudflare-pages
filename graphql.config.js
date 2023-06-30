// @ts-check
/** @type {import('@graphql-codegen/cli').CodegenConfig } */
const config = {
  overwrite: true,
  schema: './node_modules/@octokit/graphql-schema/schema.graphql',
  documents: ['./src/**/*.{graphql,js,ts}', './bin/**/*.{graphql,js,ts}'],
  emitLegacyCommonJSImports: false,
  generates: {
    '__generated__/types/graphql-operations.ts': {
      plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
      config: {
        useTypeImports: true,
        immutableTypes: true
        // flattenGeneratedTypes: true
      }
    }
  }
}

export default config
