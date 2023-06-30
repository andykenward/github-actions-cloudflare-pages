import {error, notice} from '@unlike/github-actions-core'

import {graphql} from '@/gql/gql.js'

import {request} from './api/client.js'
import {useContext} from './context.js'

/**
 * MutationCreateEnvironment will either return the environment if it exists or create it.
 */
export const MutationCreateEnvironment = graphql(/* GraphQL */ `
  mutation CreateEnvironment($repositoryId: ID!, $name: String!) {
    createEnvironment(input: {repositoryId: $repositoryId, name: $name}) {
      environment {
        name
        id
      }
    }
  }
`)

export const createEnvironment = async () => {
  const {branch, repo} = useContext()

  if (!branch) throw new Error('branch is required')

  const environment = await request(
    MutationCreateEnvironment,
    {
      repositoryId: repo.id,
      name: branch
    },
    {errorThrows: false}
  )

  if (environment.errors) {
    error(`GitHub Environment: Errors - ${JSON.stringify(environment.errors)}`)
  }

  if (!environment.data.createEnvironment?.environment) {
    notice('GitHub Environment: Not created')
  }

  /**
   * TODO: @andykenward save environment id as artifact to then delete it later
   */

  return environment.data.createEnvironment?.environment
}

export type Environment = Awaited<ReturnType<typeof createEnvironment>>

// export const QueryGetEnvironment = graphql(/* GraphQL */ `
//   query Environment(
//     $owner: String!
//     $repo: String!
//     $environment_name: String!
//   ) {
//     repository(owner: $owner, name: $repo) {
//       environment(name: $environment_name) {
//         name
//         id
//       }
//     }
//   }
// `)
/**
 * TODO: @andykenward https://docs.github.com/en/graphql/reference/mutations#deleteenvironment
 */
