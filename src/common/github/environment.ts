import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import {GetEnvironmentAndRefDocument} from '@/gql/graphql.js'

import type {GitHubApiError, GitHubGraphQLError} from './api/client.js'

import {formatGraphqlErrors, GitHubApi} from './api/client.js'
import {GitHubContext} from './context.js'

const PREFIX = `GitHub Environment:`

// oxlint-disable-next-line unicorn/throw-new-error
class EnvironmentError extends Schema.TaggedError<EnvironmentError>()(
  'EnvironmentError',
  {message: Schema.String}
) {}

/** An existing GitHub Environment, and the ref to create the deployment on. */
export interface Environment {
  readonly id: string
  readonly name: string
  readonly refId: string
}

const isEnvironmentNotFound = (error: GitHubGraphQLError): boolean =>
  error.type === 'NOT_FOUND' &&
  error.path?.join('.') === 'repository.environment'

/**
 * Checks that the environment `name` exists, failing with a message that asks
 * the user to create it — the `GITHUB_TOKEN` is not permitted to create
 * environments.
 * @see {@link https://docs.github.com/en/actions/security-guides/automatic-token-authentication#granting-additional-permissions | Granting additional permissions}
 */
export const checkEnvironment = Effect.fn('checkEnvironment')(function* (
  name: string
): Effect.fn.Return<
  Environment,
  EnvironmentError | GitHubApiError,
  GitHubApi | GitHubContext
> {
  const {repo, ref} = yield* GitHubContext
  const github = yield* GitHubApi

  const response = yield* github.request({
    query: GetEnvironmentAndRefDocument,
    variables: {
      owner: repo.owner,
      repo: repo.repo,
      environmentName: name,
      qualifiedName: ref
    },
    options: {
      errorThrows: false
    }
  })

  // GitHub reports an environment that doesn't exist as a NOT_FOUND error at
  // its path, alongside `environment: null` — which the next check reports.
  if (response.errors?.some(error => !isEnvironmentNotFound(error))) {
    return yield* new EnvironmentError({
      message: `${PREFIX} Errors - ${formatGraphqlErrors(response.errors)}`
    })
  }

  const environment = response.data?.repository?.environment
  if (!environment) {
    return yield* new EnvironmentError({
      message: `${PREFIX} Not created for ${name}`
    })
  }

  const refId = response.data?.repository?.ref?.id
  if (!refId) {
    return yield* new EnvironmentError({
      message: `${PREFIX} No ref id ${name}`
    })
  }

  return {id: environment.id, name: environment.name, refId}
})
