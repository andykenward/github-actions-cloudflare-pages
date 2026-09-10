import {debug, info} from '@actions/core'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Schema from 'effect/Schema'

import type {Summary} from '@/common/summary.js'

import {batchDelete, PREFIX} from '@/common/batch-delete.js'
import {errorMessage} from '@/common/errors.js'
import {GitHubRestApi} from '@/common/github/api/paginate.js'
import {getGitHubDeployments} from '@/common/github/deployment/get.js'
import {CommonInputs, PayloadV1Inputs} from '@/common/inputs.js'
import {CommonLayer} from '@/common/layer.js'
import {writeSummary} from '@/common/summary.js'

import {DeleteInputs} from './inputs.js'

/**
 * Bounds the fan-out across Cloudflare and GitHub. Previously every deployment
 * was deleted at once via `Promise.all`, which on a busy repo issued one
 * Cloudflare DELETE plus two or three GitHub GraphQL calls per deployment
 * simultaneously (now one of each).
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

/** Writes the job summary under the action's heading. */
const writeDeleteSummary = (build: (summary: Summary) => Summary) =>
  writeSummary(
    summary => build(summary.addHeading(HEADING).addBreak()),
    DeleteError.from
  )

/**
 * Every service `run` needs, built from the action inputs and runner env.
 * `CommonInputs.layer` is also inside `CommonLayer`, but it is built once: a
 * layer is memoised by reference across a single `Effect.provide`.
 */
export const DeleteLayer = Layer.mergeAll(
  CommonLayer,
  DeleteInputs.layer,
  PayloadV1Inputs.layer,
  GitHubRestApi.layer.pipe(Layer.provide(CommonInputs.layer))
)

/** See the note on `run` in `src/deploy/main.ts`. */
export const run = Effect.gen(function* () {
  let deployments = yield* getGitHubDeployments

  const {keepLatest} = yield* DeleteInputs

  if (deployments.length > 0 && keepLatest) {
    info(`${PREFIX} Keeping latest ${keepLatest} deployments`)
    deployments = deployments.slice(keepLatest)
  }

  if (deployments.length === 0) {
    info(`${PREFIX} No deployments to delete`)

    yield* writeDeleteSummary(summary =>
      summary.addTable([['No deployments to delete']])
    )
    return
  }

  // `unicorn/no-array-for-each` matches on the name; this is Effect's
  // bounded-concurrency combinator, not `Array#forEach`.
  // oxlint-disable-next-line unicorn/no-array-for-each
  const values = yield* Effect.forEach(
    deployments,
    deployment => batchDelete(deployment),
    {concurrency: DELETE_CONCURRENCY}
  )

  debug(`${PREFIX} Deleted deployments: ${JSON.stringify(values)}`)

  yield* writeDeleteSummary(summary =>
    summary
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
  )

  /**
   * `batchDelete` reports per-deployment failures as rows rather than
   * failing, so the rest still get deleted. Fail the step once the summary is
   * written — previously it exited 0 even when every deletion failed.
   */
  const failed = values.filter(value => !value.success).length
  if (failed > 0) {
    return yield* new DeleteError({
      message: `${PREFIX} ${failed} of ${values.length} deployments failed to delete; see the job summary for details`,
      cause: undefined
    })
  }
})
