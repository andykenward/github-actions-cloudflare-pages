import {error, getInput, notice} from '@unlike/github-actions-core'

import {graphql} from '@/gql/gql.js'

import {ACTION_INPUT_GITHUB_ENVIRONMENT} from '../constants.js'
import {request} from './api/client.js'
import {useContext} from './context.js'

export const EnvironmentFragment = graphql(/* GraphQL */ `
  fragment EnvironmentFragment on Environment {
    name
    id
  }
`)

/**
 * MutationCreateEnvironment will either return the environment if it exists or create it.
 * GITHUB_TOKEN Action permissions don't allow for creating environments.
 * @see {@link https://docs.github.com/en/actions/security-guides/automatic-token-authentication#granting-additional-permissions | Granting additional permissions}
 * @see {@link https://docs.github.com/en/graphql/reference/mutations#createenvironment | `createEnvironment`}
 */
export const MutationCreateEnvironment = graphql(/* GraphQL */ `
  mutation CreateEnvironment($repositoryId: ID!, $name: String!) {
    createEnvironment(input: {repositoryId: $repositoryId, name: $name}) {
      environment {
        ...EnvironmentFragment
      }
    }
  }
`)

export const createEnvironment = async () => {
  const {branch, repo} = useContext()

  if (!branch) throw new Error('branch is required')

  const environment = await request({
    query: MutationCreateEnvironment,
    variables: {
      repositoryId: repo.id,
      name: branch
    },
    options: {
      errorThrows: false
    }
  })

  if (environment.errors) {
    error(`GitHub Environment: Errors - ${JSON.stringify(environment.errors)}`)
  }

  if (!environment.data.createEnvironment?.environment) {
    notice('GitHub Environment: Not created')
  }

  return environment.data.createEnvironment?.environment
}

export const QueryGetEnvironment = graphql(/* GraphQL */ `
  query GetEnvironment(
    $owner: String!
    $repo: String!
    $environment_name: String!
  ) {
    repository(owner: $owner, name: $repo) {
      environment(name: $environment_name) {
        ...EnvironmentFragment
      }
    }
  }
`)

/**
 * CheckEnvironment will check if the environment exists and if it does not it
 * will error to the users to create the environment themselves.
 */
export const checkEnvironment = async () => {
  const environmentName = getInput(ACTION_INPUT_GITHUB_ENVIRONMENT, {
    required: true
  })
  const {repo} = useContext()

  const environment = await request({
    query: QueryGetEnvironment,
    variables: {
      owner: repo.owner,
      repo: repo.repo,
      environment_name: environmentName
    },
    options: {
      errorThrows: false
    }
  })

  if (environment.errors) {
    error(`GitHub Environment: Errors - ${JSON.stringify(environment.errors)}`)
  }

  if (!environment.data.repository?.environment) {
    notice(`GitHub Environment: Not created for ${environmentName}`)
  }

  return environment.data.repository?.environment
}

export type Environment = Awaited<ReturnType<typeof checkEnvironment>>
