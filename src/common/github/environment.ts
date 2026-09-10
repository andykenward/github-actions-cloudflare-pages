import {error, notice} from '@actions/core'
import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import {CommonInputs} from '@/common/inputs.js'
import {graphql} from '@/gql/gql.js'

import {GitHubApi} from './api/client.js'
import {GitHubContext} from './context.js'

const PREFIX = `GitHub Environment:`

// oxlint-disable-next-line unicorn/throw-new-error
class EnvironmentError extends Schema.TaggedError<EnvironmentError>()(
  'EnvironmentError',
  {message: Schema.String}
) {}

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

export const createEnvironment = Effect.gen(function* () {
  const {branch, repo} = yield* GitHubContext

  if (!branch) {
    return yield* new EnvironmentError({message: 'branch is required'})
  }

  const github = yield* GitHubApi

  const environment = yield* github.request({
    query: MutationCreateEnvironment,
    variables: {
      repositoryId: repo.node_id,
      name: branch
    },
    options: {
      errorThrows: false
    }
  })

  if (environment.errors) {
    error(`${PREFIX} Errors - ${JSON.stringify(environment.errors)}`)
  }

  if (!environment.data.createEnvironment?.environment) {
    notice(`${PREFIX} Not created`)
  }

  return environment.data.createEnvironment?.environment
})

export const QueryGetEnvironment = graphql(/* GraphQL */ `
  query GetEnvironment(
    $owner: String!
    $repo: String!
    $environment_name: String!
    $qualifiedName: String!
  ) {
    repository(owner: $owner, name: $repo) {
      environment(name: $environment_name) {
        ...EnvironmentFragment
      }
      ref(qualifiedName: $qualifiedName) {
        id
      }
    }
  }
`)

/**
 * CheckEnvironment will check if the environment exists and if it does not it
 * will error to the users to create the environment themselves.
 */
export const checkEnvironment = Effect.gen(function* () {
  const {gitHubEnvironment} = yield* CommonInputs
  const {repo, ref} = yield* GitHubContext

  if (!gitHubEnvironment) {
    return yield* new EnvironmentError({
      message: `${PREFIX} missing input gitHubEnvironment ${gitHubEnvironment}`
    })
  }

  const github = yield* GitHubApi

  const environment = yield* github.request({
    query: QueryGetEnvironment,
    variables: {
      owner: repo.owner,
      repo: repo.repo,
      environment_name: gitHubEnvironment,
      qualifiedName: ref
    },
    options: {
      errorThrows: false
    }
  })

  if (environment.errors) {
    return yield* new EnvironmentError({
      message: `${PREFIX} Errors - ${JSON.stringify(environment.errors)}`
    })
  }

  if (!environment.data.repository?.environment) {
    return yield* new EnvironmentError({
      message: `${PREFIX} Not created for ${gitHubEnvironment}`
    })
  }

  if (!environment.data.repository?.ref?.id) {
    return yield* new EnvironmentError({
      message: `${PREFIX} No ref id ${gitHubEnvironment}`
    })
  }

  return {
    ...environment.data.repository.environment,
    refId: environment.data.repository.ref.id
  }
})

export type Environment = Effect.Success<typeof checkEnvironment>
