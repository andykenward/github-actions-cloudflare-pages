import assert from 'node:assert/strict'

import {debug, info, warning} from '@actions/core'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Schema from 'effect/Schema'

import type {BatchDeleteItem} from '@/common/batch-delete.js'
import type {Summary} from '@/common/summary.js'

import {batchDelete, PREFIX} from '@/common/batch-delete.js'
import {errorMessage} from '@/common/errors.js'
import {GitHubRestApi} from '@/common/github/api/paginate.js'
import {getGitHubDeployments} from '@/common/github/deployment/get.js'
import {code, escapeHtml, headerRow, link} from '@/common/html.js'
import {PayloadV1Inputs} from '@/common/inputs.js'
import {CommonLayer} from '@/common/layer.js'
import {writeSummary} from '@/common/summary.js'

import {DeleteInputs} from './inputs.js'

/**
 * Bounds the fan-out: each deletion is one Cloudflare DELETE and one GitHub
 * GraphQL request, so this many run at once on a busy repository.
 */
const DELETE_CONCURRENCY = 5

/**
 * The most deployments one run deletes. Each is one Cloudflare and one GitHub
 * request, and GitHub's GraphQL budget is 5 000 points an hour; a run that
 * hits the cap says so and the next run continues.
 */
const DELETE_COUNT_MAX = 500

const HEADING = 'andykenward/github-actions-cloudflare-pages'

/** See the note on `DeployError` in `src/deploy/main.ts`. */
// oxlint-disable-next-line unicorn/throw-new-error
class DeleteError extends Schema.TaggedError<DeleteError>()('DeleteError', {
  message: Schema.String,
  cause: Schema.optional(Schema.Defect())
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

/** The summary table of every deletion attempted, one row each. */
const deletedSummary =
  (rows: ReadonlyArray<BatchDeleteItem>) =>
  (summary: Summary): Summary =>
    summary
      .addHeading('Deleted Deployments')
      .addBreak()
      .addTable([
        headerRow(
          'GitHub Deployment Id',
          'Success',
          'Environment',
          'Environment Url',
          'Comment Id',
          'Error'
        ),
        ...rows.map(value => [
          escapeHtml(value.deploymentId),
          value.success ? '✅' : '❌',
          escapeHtml(value.environment),
          value.environmentUrl
            ? link(value.environmentUrl, code(value.environmentUrl))
            : '',
          escapeHtml(value.commentId ?? ''),
          escapeHtml(value.error ?? value.warning ?? '')
        ])
      ])

/**
 * Every service `run` needs, built from the action inputs and runner env.
 * `GitHubRestApi` takes its inputs from `CommonLayer`, which stays exposed.
 */
export const DeleteLayer = Layer.mergeAll(
  GitHubRestApi.layer.pipe(Layer.provideMerge(CommonLayer)),
  DeleteInputs.layer,
  PayloadV1Inputs.layer
)

/** See the note on `run` in `src/deploy/main.ts`. */
export const run = Effect.gen(function* () {
  const {keepLatest, gitHubEnvironment} = yield* DeleteInputs

  const deploymentsListed = yield* getGitHubDeployments({
    environment: gitHubEnvironment
  })

  if (deploymentsListed.length > 0 && keepLatest) {
    info(`${PREFIX} Keeping latest ${keepLatest} deployments`)
  }
  // Listed newest first, so the first `keepLatest` are the ones to keep.
  const deploymentsRemaining = keepLatest
    ? deploymentsListed.slice(keepLatest)
    : deploymentsListed
  assert.ok(deploymentsRemaining.length <= deploymentsListed.length)

  if (deploymentsRemaining.length > DELETE_COUNT_MAX) {
    warning(
      `${PREFIX} Deleting the oldest ${DELETE_COUNT_MAX} of ${deploymentsRemaining.length} deployments; re-run to delete the rest`
    )
  }
  // The oldest go first, so repeated runs converge on `keepLatest`.
  const deploymentsToDelete = deploymentsRemaining.slice(-DELETE_COUNT_MAX)
  assert.ok(deploymentsToDelete.length <= DELETE_COUNT_MAX)

  if (deploymentsToDelete.length === 0) {
    info(`${PREFIX} No deployments to delete`)

    yield* writeDeleteSummary(summary =>
      summary.addTable([['No deployments to delete']])
    )
    return
  }

  // `unicorn/no-array-for-each` matches on the name; this is Effect's
  // bounded-concurrency combinator, not `Array#forEach`.
  // oxlint-disable-next-line unicorn/no-array-for-each
  const rows = yield* Effect.forEach(
    deploymentsToDelete,
    deployment => batchDelete(deployment),
    {concurrency: DELETE_CONCURRENCY}
  )

  assert.equal(rows.length, deploymentsToDelete.length)
  debug(`${PREFIX} Deleted deployments: ${JSON.stringify(rows)}`)

  yield* writeDeleteSummary(deletedSummary(rows))

  /**
   * `batchDelete` reports per-deployment failures as rows rather than
   * failing, so the rest still get deleted. Fail the step once the summary is
   * written, so it still lists every row.
   */
  const failedCount = rows.filter(row => !row.success).length
  if (failedCount > 0) {
    return yield* new DeleteError({
      message: `${PREFIX} ${failedCount} of ${rows.length} deployments failed to delete; see the job summary for details`
    })
  }
})
