import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import {createCloudflareDeployment} from '@/common/cloudflare/deployment/create.js'
import {addComment} from '@/common/github/comment.js'
import {useContextEvent} from '@/common/github/context.js'
import {createGitHubDeployment} from '@/common/github/deployment/create.js'
import {checkEnvironment} from '@/common/github/environment.js'

import {useInputs} from './inputs.js'

/** Only these events carry the context the deploy needs. */
const SUPPORTED_EVENT_NAMES = new Set([
  'push',
  'pull_request',
  'workflow_dispatch',
  'workflow_run'
])

/**
 * `message` is what `Error.message` resolves to, so `index.ts` only has to
 * surface it via `setFailed`.
 */
// oxlint-disable-next-line unicorn/throw-new-error
class DeployError extends Schema.TaggedError<DeployError>()('DeployError', {
  message: Schema.String,
  cause: Schema.Defect()
}) {
  static readonly from = (cause: unknown): DeployError =>
    new DeployError({
      message: cause instanceof Error ? cause.message : String(cause),
      cause
    })
}

/**
 * Exported as an Effect value rather than a function: Effect is already lazy,
 * so a zero-argument wrapper is pure indirection (`effecttsgo/lazy-effect`).
 */
export const run: Effect.Effect<void, DeployError> = Effect.gen(function* () {
  const {
    cloudflareAccountId,
    cloudflareProjectName,
    directory,
    workingDirectory,
    branch
  } = yield* Effect.try({
    try: () => useInputs(),
    catch: DeployError.from
  })

  const {eventName} = yield* Effect.try({
    try: () => useContextEvent(),
    catch: DeployError.from
  })

  if (!SUPPORTED_EVENT_NAMES.has(eventName)) {
    return yield* new DeployError({
      message: `GitHub Action event name '${eventName}' not supported.`,
      cause: undefined
    })
  }

  const {deployment: cloudflareDeployment, wranglerOutput} =
    yield* Effect.tryPromise({
      try: () =>
        createCloudflareDeployment({
          accountId: cloudflareAccountId,
          projectName: cloudflareProjectName,
          directory,
          workingDirectory,
          branch
        }),
      catch: DeployError.from
    })

  const [commentId, environment] = yield* Effect.all(
    [
      Effect.tryPromise({
        try: () => addComment(cloudflareDeployment, wranglerOutput),
        catch: DeployError.from
      }),
      Effect.tryPromise({
        try: () => checkEnvironment(),
        catch: DeployError.from
      })
    ],
    {concurrency: 'unbounded'}
  )

  yield* Effect.tryPromise({
    try: () =>
      createGitHubDeployment({
        cloudflareDeployment,
        commentId,
        cloudflareAccountId,
        environment
      }),
    catch: DeployError.from
  })
})
