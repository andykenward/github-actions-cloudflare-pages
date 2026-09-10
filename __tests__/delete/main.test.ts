import {info, summary} from '@actions/core'
import * as Effect from 'effect/Effect'
import {describe, expect, test, vi} from 'vitest'

import {batchDelete} from '@/common/batch-delete.js'
import {getGitHubDeployments} from '@/common/github/deployment/get.js'
import {run} from '@/delete/main.js'
import {DEPLOYMENT} from '@/fixtures/github-deployment.js'

vi.mock(import('@actions/core'))
vi.mock(import('@/common/batch-delete.js'))
vi.mock(import('@/common/github/deployment/get.js'))

const ROW = {
  deploymentId: DEPLOYMENT.node_id,
  environment: DEPLOYMENT.environment
}

describe('delete', () => {
  describe('run effect', () => {
    test('succeeds when there are no deployments', async () => {
      expect.assertions(2)

      vi.mocked(getGitHubDeployments).mockResolvedValue([])

      await expect(Effect.runPromise(run)).resolves.toBeUndefined()
      expect(info).toHaveBeenCalledWith('delete - No deployments to delete')
    })

    test('succeeds when every deployment is deleted', async () => {
      expect.assertions(2)

      vi.mocked(getGitHubDeployments).mockResolvedValue([
        DEPLOYMENT,
        DEPLOYMENT
      ])
      vi.mocked(batchDelete).mockResolvedValue({...ROW, success: true})

      await expect(Effect.runPromise(run)).resolves.toBeUndefined()
      expect(batchDelete).toHaveBeenCalledTimes(2)
    })

    test('fails after writing the summary when any deployment fails', async () => {
      expect.assertions(3)

      vi.mocked(getGitHubDeployments).mockResolvedValue([
        DEPLOYMENT,
        DEPLOYMENT
      ])
      vi.mocked(batchDelete)
        .mockResolvedValueOnce({...ROW, success: true})
        .mockResolvedValueOnce({...ROW, success: false, error: 'boom'})

      const error = await Effect.runPromise(Effect.flip(run))

      expect(error.message).toBe(
        'delete - 1 of 2 deployments failed to delete; see the job summary for details'
      )
      // Both deletions are still attempted, and the summary still written.
      expect(batchDelete).toHaveBeenCalledTimes(2)
      expect(summary.write).toHaveBeenCalledTimes(1)
    })
  })
})
