import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

import type {MockApi} from '@/tests/helpers/api.js'

import RESPONSE_DEPLOYMENTS from '@/responses/api.cloudflare.com/pages/deployments/deployments.response.json' with {type: 'json'}
import {setMockApi} from '@/tests/helpers/api.js'
import {EVENT_NAMES} from '@/types/github/workflow-events.js'

import type {PagesDeployment} from '@/common/cloudflare/types.js'
import type {WorkflowEventExtract} from '@/common/github/workflow-event/types.js'

import {addComment, MutationAddComment} from '@/common/github/comment.js'
import * as Context from '@/common/github/context.js'

vi.mock('@actions/core')

describe('addComment', () => {
  const mockData = RESPONSE_DEPLOYMENTS.result[0] as unknown as PagesDeployment
  let mockApi: MockApi

  beforeEach(() => {
    mockApi = setMockApi()
  })

  afterEach(async () => {
    mockApi.mockAgent.assertNoPendingInterceptors()
    await mockApi.mockAgent.close()
  })

  test('should add comment', async () => {
    expect.assertions(1)

    mockApi.interceptGithub(
      {
        query: MutationAddComment,
        variables: {
          subjectId: 'MDExOlB1bGxSZXF1ZXN0Mjc5MTQ3NDM3',
          body: '## Cloudflare Pages Deployment\n**Event Name:** pull_request\n**Environment:** production\n**Project:** cloudflare-pages-action\n**Built with commit:** mock-github-sha\n**Preview URL:** https://206e215c.cloudflare-pages-action-a5z.pages.dev\n**Branch Preview URL:** https://unknown-branch.cloudflare-pages-action-a5z.pages.dev\n\n### Wrangler Output\nsuccess'
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
  })

  const eventNames = EVENT_NAMES.filter(
    eventName => eventName !== 'pull_request'
  )

  test.each([eventNames])(
    `should return undefined for eventName: %s`,
    async eventName => {
      expect.assertions(2)
      expect(EVENT_NAMES).toContain(eventName)

      vi.spyOn(Context, 'useContextEvent').mockReturnValue({
        eventName,
        payload: {}
      } as Readonly<WorkflowEventExtract<typeof eventName>>)

      await expect(addComment(mockData, 'success')).resolves.toBeUndefined()
    }
  )
})
