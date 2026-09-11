import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import {CommonInputs} from '@/common/inputs.js'
import {GetEnvironmentAndRefDocument} from '@/gql/graphql.js'
import {INPUT_KEY_GITHUB_ENVIRONMENT} from '@/input-keys'

import type {GitHubGraphQLError} from './api/client.js'

import {GitHubApi} from './api/client.js'
import {GitHubContext} from './context.js'

const PREFIX = `GitHub Environment:`

// oxlint-disable-next-line unicorn/throw-new-error
class EnvironmentError extends Schema.TaggedError<EnvironmentError>()(
  'EnvironmentError',
  {message: Schema.String}
) {}

const isEnvironmentNotFound = (error: GitHubGraphQLError): boolean =>
  error.type === 'NOT_FOUND' &&
  error.path?.join('.') === 'repository.environment'

/**
 * CheckEnvironment will check if the environment exists and if it does not it
 * will error to the users to create the environment themselves — the
 * `GITHUB_TOKEN` is not permitted to create environments.
 * @see {@link https://docs.github.com/en/actions/security-guides/automatic-token-authentication#granting-additional-permissions | Granting additional permissions}
 */
export const checkEnvironment = Effect.gen(function* () {
  const {gitHubEnvironment} = yield* CommonInputs
  const {repo, ref} = yield* GitHubContext

  if (!gitHubEnvironment) {
    return yield* new EnvironmentError({
      message: `${PREFIX} Input required and not supplied: ${INPUT_KEY_GITHUB_ENVIRONMENT}`
    })
  }

  const github = yield* GitHubApi

  const environment = yield* github.request({
    query: GetEnvironmentAndRefDocument,
    variables: {
      owner: repo.owner,
      repo: repo.repo,
      environmentName: gitHubEnvironment,
      qualifiedName: ref
    },
    options: {
      errorThrows: false
    }
  })

  // GitHub reports an environment that doesn't exist as a NOT_FOUND error at
  // its path, alongside `environment: null` — which the next check reports.
  if (environment.errors?.some(error => !isEnvironmentNotFound(error))) {
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
