import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

import type {PagesDeployment} from '@/src/cloudflare/types.js'
import type {WorkflowEventExtract} from '@/src/github/workflow-event/types.js'
import RESPONSE_DEPLOYMENTS from '@/responses/api.cloudflare.com/pages/deployments/deployments.response.json'
import {addComment, MutationAddComment} from '@/src/github/comment.js'
import * as Context from '@/src/github/context.js'
import {EVENT_NAMES} from '@/types/github/workflow-events.js'

import type {MockApi} from '../helpers/index.js'
import {setMockApi, setRequiredInputEnv} from '../helpers/index.js'

vi.mock('@unlike/github-actions-core')
describe('addComment', () => {
  const mockData = RESPONSE_DEPLOYMENTS.result[0] as unknown as PagesDeployment
  let mockApi: MockApi
  beforeEach(() => {
    mockApi = setMockApi()

    setRequiredInputEnv()
  })

  afterEach(async () => {
    mockApi.mockAgent.assertNoPendingInterceptors()
    await mockApi.mockAgent.close()
  })
  test('should add comment', async () => {
    mockApi.interceptGithub(
      {
        query: MutationAddComment,
        variables: {
          subjectId: 'MDExOlB1bGxSZXF1ZXN0Mjc5MTQ3NDM3',
          body: '## Cloudflare Pages Deployment\n **Environment:** production \n **Project:** cloudflare-pages-action \n **Built with commit:** mock-github-sha\n **Preview URL:** https://206e215c.cloudflare-pages-action-a5z.pages.dev \n **Branch Preview URL:** https://unknown-branch.cloudflare-pages-action-a5z.pages.dev'
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

    expect.assertions(1)
    const comment = await addComment(mockData)
    expect(comment).toBe('1')
  })

  const eventNames = EVENT_NAMES.filter(
    eventName => eventName !== 'pull_request'
  )
  test.each([eventNames])(
    `should throw error if for eventName: %s`,
    async eventName => {
      expect.assertions(2)
      expect(EVENT_NAMES.includes(eventName)).toBeTruthy()

      vi.spyOn(Context, 'useContextEvent').mockReturnValue({
        eventName,
        payload: {}
      } as Readonly<WorkflowEventExtract<typeof eventName>>)

      await expect(addComment(mockData)).rejects.toThrow(`Not a pull request`)
    }
  )
})
