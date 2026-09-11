import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Schema from 'effect/Schema'

import {createCloudflareDeployment} from '@/common/cloudflare/deployment/create.js'
import {addComment, pullRequestToComment} from '@/common/github/comment.js'
import {GitHubContext} from '@/common/github/context.js'
import {createGitHubDeployment} from '@/common/github/deployment/create.js'
import {checkEnvironment} from '@/common/github/environment.js'
import {CommonLayer} from '@/common/layer.js'

import {DeployInputs} from './inputs.js'

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
  message: Schema.String
}) {}

/** Every service `run` needs, built from the action inputs and runner env. */
export const DeployLayer = Layer.mergeAll(CommonLayer, DeployInputs.layer)

/**
 * Exported as an Effect value rather than a function: Effect is already lazy,
 * so a zero-argument wrapper is pure indirection (`effecttsgo/lazy-effect`).
 * Requires the services in `DeployLayer`; tests can provide their own.
 */
export const run = Effect.gen(function* () {
  const {
    cloudflareAccountId,
    cloudflareProjectName,
    directory,
    workingDirectory,
    branch
  } = yield* DeployInputs

  const {event} = yield* GitHubContext

  if (!SUPPORTED_EVENT_NAMES.has(event.eventName)) {
    return yield* new DeployError({
      message: `GitHub Action event name '${event.eventName}' not supported.`
    })
  }

  /**
   * The environment check and the pull request lookup don't need the
   * deployment, so they run while wrangler does. Either failing interrupts the
   * deploy, which kills wrangler — previously a missing environment failed the
   * step only after a full upload, leaving an orphaned Cloudflare deployment.
   */
  const [
    {deployment: cloudflareDeployment, wranglerOutput},
    environment,
    pullRequestId
  ] = yield* Effect.all(
    [
      createCloudflareDeployment({
        accountId: cloudflareAccountId,
        projectName: cloudflareProjectName,
        directory,
        workingDirectory,
        branch
      }),
      checkEnvironment,
      pullRequestToComment
    ],
    {concurrency: 'unbounded'}
  )

  const commentId = yield* addComment(
    pullRequestId,
    cloudflareDeployment,
    wranglerOutput
  )

  yield* createGitHubDeployment({
    cloudflareDeployment,
    commentId,
    cloudflareAccountId,
    environment
  })
})
