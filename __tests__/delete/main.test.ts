import {info, setSecret, summary} from '@actions/core'
import {it} from '@effect/vitest'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import {describe, expect, vi} from 'vitest'

import type {GitHubDeployment} from '@/common/github/deployment/get.js'

import {batchDelete} from '@/common/batch-delete.js'
import {GitHubRestApi} from '@/common/github/api/paginate.js'
import {DeleteLayer, run} from '@/delete/main.js'
import {DEPLOYMENT} from '@/fixtures/github-deployment.js'

vi.mock(import('@actions/core'))
vi.mock(import('@/common/batch-delete.js'))

const ROW = {
  deploymentId: DEPLOYMENT.node_id,
  environment: DEPLOYMENT.environment
}

/**
 * A `GitHubRestApi` that lists `deployments`. Provided inside `DeleteLayer`, so
 * it takes the place of the real client for `run`.
 */
const listing = (deployments: Array<GitHubDeployment>) =>
  Layer.succeed(
    GitHubRestApi,
    GitHubRestApi.of({
      paginate: () => Effect.succeed(deployments as never)
    })
  )

describe('delete', () => {
  describe('run effect', () => {
    it.effect('succeeds when there are no deployments', () =>
      Effect.gen(function* () {
        expect.assertions(2)

        expect(yield* run).toBeUndefined()
        expect(info).toHaveBeenCalledWith('delete - No deployments to delete')
      }).pipe(Effect.provide(listing([])), Effect.provide(DeleteLayer))
    )

    it.effect('builds CommonInputs once though DeleteLayer uses it twice', () =>
      Effect.gen(function* () {
        expect.assertions(1)

        yield* run

        // One `setSecret` per token: a second build would register them again.
        expect(setSecret).toHaveBeenCalledTimes(2)
      }).pipe(Effect.provide(listing([])), Effect.provide(DeleteLayer))
    )

    it.effect('succeeds when every deployment is deleted', () =>
      Effect.gen(function* () {
        expect.assertions(2)

        vi.mocked(batchDelete).mockReturnValue(
          Effect.succeed({...ROW, success: true})
        )

        expect(yield* run).toBeUndefined()
        expect(batchDelete).toHaveBeenCalledTimes(2)
      }).pipe(
        Effect.provide(listing([DEPLOYMENT, DEPLOYMENT])),
        Effect.provide(DeleteLayer)
      )
    )

    it.effect('fails after writing the summary when any deployment fails', () =>
      Effect.gen(function* () {
        expect.assertions(3)

        vi.mocked(batchDelete)
          .mockReturnValueOnce(Effect.succeed({...ROW, success: true}))
          .mockReturnValueOnce(
            Effect.succeed({...ROW, success: false, error: 'boom'})
          )

        const error = yield* Effect.flip(run)

        expect(error.message).toBe(
          'delete - 1 of 2 deployments failed to delete; see the job summary for details'
        )
        // Both deletions are still attempted, and the summary still written.
        expect(batchDelete).toHaveBeenCalledTimes(2)
        expect(summary.write).toHaveBeenCalledTimes(1)
      }).pipe(
        Effect.provide(listing([DEPLOYMENT, DEPLOYMENT])),
        Effect.provide(DeleteLayer)
      )
    )
  })
})
