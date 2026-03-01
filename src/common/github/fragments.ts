import {graphql} from '@/gql/gql.js'

export const EnvironmentFragment = graphql(/* GraphQL */ `
  fragment EnvironmentFragment on Environment {
    name
    id
  }
`)
