import {debug, info, summary} from '@actions/core'
import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import {batchDelete} from '@/common/batch-delete.js'
import {errorMessage} from '@/common/errors.js'
import {getGitHubDeployments} from '@/common/github/deployment/get.js'

import {useInputs} from './inputs.js'

const PREFIX = `delete -`

/**
 * Bounds the fan-out across Cloudflare and GitHub. Previously every deployment
 * was deleted at once via `Promise.all`, which on a busy repo issues one
 * Cloudflare DELETE plus two or three GitHub GraphQL calls per deployment
 * simultaneously.
 */
const DELETE_CONCURRENCY = 5

const HEADING = 'andykenward/github-actions-cloudflare-pages'

/** See the note on `DeployError` in `src/deploy/main.ts`. */
// oxlint-disable-next-line unicorn/throw-new-error
class DeleteError extends Schema.TaggedError<DeleteError>()('DeleteError', {
  message: Schema.String,
  cause: Schema.Defect()
}) {
  static readonly from = (cause: unknown): DeleteError =>
    new DeleteError({
      message: `${PREFIX} Error deleting deployments: ${errorMessage(cause)}`,
      cause
    })
}

/** See the note on `run` in `src/deploy/main.ts`. */
export const run: Effect.Effect<void, DeleteError> = Effect.gen(function* () {
  let deployments = yield* Effect.tryPromise({
    try: () => getGitHubDeployments(),
    catch: DeleteError.from
  })

  const {keepLatest} = yield* Effect.try({
    try: () => useInputs(),
    catch: DeleteError.from
  })

  if (deployments.length > 0 && keepLatest) {
    info(`${PREFIX} Keeping latest ${keepLatest} deployments`)
    deployments = deployments.slice(keepLatest)
  }

  if (deployments.length === 0) {
    info(`${PREFIX} No deployments to delete`)

    yield* Effect.tryPromise({
      try: () =>
        summary
          .addHeading(HEADING)
          .addBreak()
          .addTable([['No deployments to delete']])
          .write(),
      catch: DeleteError.from
    })
    return
  }

  // `unicorn/no-array-for-each` matches on the name; this is Effect's
  // bounded-concurrency combinator, not `Array#forEach`.
  // oxlint-disable-next-line unicorn/no-array-for-each
  const values = yield* Effect.forEach(
    deployments,
    deployment =>
      Effect.tryPromise({
        try: () => batchDelete(deployment),
        catch: DeleteError.from
      }),
    {concurrency: DELETE_CONCURRENCY}
  )

  debug(`${PREFIX} Deleted deployments: ${JSON.stringify(values)}`)

  if (values.length > 0) {
    yield* Effect.tryPromise({
      try: () =>
        summary
          .addHeading(HEADING)
          .addBreak()
          .addHeading('Deleted Deployments')
          .addBreak()
          .addTable([
            [
              {data: 'GitHub Deployment Id', header: true},
              {data: 'Success', header: true},
              {data: 'Environment', header: true},
              {data: 'Environment Url', header: true},
              {data: 'Comment Id', header: true},
              {data: 'Error', header: true}
            ],
            ...values.map(value => [
              value.deploymentId,
              value.success ? '✅' : '❌',
              value.environment,
              value.environmentUrl
                ? `<a href='${value.environmentUrl}'><code>${value.environmentUrl}</code></a>`
                : '',
              value.commentId || '',
              value.error || ''
            ])
          ])
          .write(),
      catch: DeleteError.from
    })
  }
})
