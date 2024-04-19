import {graphql} from '@/gql/gql.js'

export const DeploymentFragment = graphql(/* GraphQL */ `
  fragment DeploymentFragment on Deployment {
    id
    environment
    state
  }
`)
