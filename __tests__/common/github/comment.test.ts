import * as core from '@actions/core'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

import type {MockApi} from '@/tests/helpers/api.js'

import RESPONSE_DEPLOYMENTS from '@/responses/api.cloudflare.com/pages/deployments/deployments.response.json' with {type: 'json'}
import {setMockApi} from '@/tests/helpers/api.js'
import {stubTestEnvVars} from '@/tests/helpers/env.js'

import type {PagesDeployment} from '@/common/cloudflare/types.js'

vi.mock('@actions/core')

describe('addComment', () => {
  const mockData = RESPONSE_DEPLOYMENTS.result[0] as unknown as PagesDeployment
  let mockApi: MockApi

  beforeEach(() => {
    vi.resetModules()
    mockApi = setMockApi()
    vi.spyOn(core, 'info').mockImplementation(() => {})
  })

  afterEach(async () => {
    mockApi.mockAgent.assertNoPendingInterceptors()
    await mockApi.mockAgent.close()

    vi.restoreAllMocks()
  })

  test.each([
    ['pull_request', 'MDExOlB1bGxSZXF1ZXN0Mjc5MTQ3NDM3', 'mock-github-sha'],
    // ['workflow_dispatch', '123', 'mock-github-sha']
    ['workflow_run', 'MDExOldvcmtmbG93UnVuMjg5NzgyNDUx', 'mock-github-sha']
  ] as const)('should add comment', async (eventName, subjectId, sha) => {
    expect.assertions(2)

    stubTestEnvVars(eventName)
    const {addComment, MutationAddComment} = await import(
      '@/common/github/comment.js'
    )

    mockApi.interceptGithub(
      {
        query: MutationAddComment,
        variables: {
          subjectId: subjectId,
          body:
            '## Cloudflare Pages Deployment\n' +
            `**Event Name:** ${eventName}\n` +
            '**Environment:** production\n' +
            '**Project:** cloudflare-pages-action\n' +
            `**Built with commit:** ${sha}\n` +
            '**Preview URL:** https://206e215c.cloudflare-pages-action-a5z.pages.dev\n' +
            '**Branch Preview URL:** https://unknown-branch.cloudflare-pages-action-a5z.pages.dev\n' +
            '\n' +
            '### Wrangler Output\n' +
            'success'
        }
      },
      {
        data: {
          addComment: {
            commentEdge: {
              node: {
                id: '1'
              }
            }
          }
        }
      }
    )
    const comment = await addComment(mockData, 'success')

    expect(comment).toBe('1')
    expect(core.info).not.toHaveBeenCalled()

    vi.unstubAllEnvs()
  })
})
