import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

import type {PagesDeployment} from '@/src/cloudflare/types.js'
import RESPONSE_DEPLOYMENTS from '@/responses/api.cloudflare.com/pages/deployments/deployments.response.json'
import {addComment, MutationAddComment} from '@/src/github/comment.js'

import type {MockApi} from '../helpers/index.js'
import {setMockApi, setRequiredInputEnv} from '../helpers/index.js'

vi.mock('@unlike/github-actions-core')
describe('addComment', () => {
  let mockApi: MockApi
  beforeEach(() => {
    mockApi = setMockApi()

    setRequiredInputEnv()
  })

  afterEach(async () => {
    await mockApi.mockAgent.close()
  })
  test('should add comment', async () => {
    mockApi.interceptGithub(
      {
        query: MutationAddComment,
        variables: {
          subjectId: 'MDExOlB1bGxSZXF1ZXN0Mjc5MTQ3NDM3',
          body: 'Cloudflare Pages Deployment\n Environment: production \n Built with commit mock-github-sha\n Preview URL: https://206e215c.cloudflare-pages-action-a5z.pages.dev \n Branch Preview URL: https://unknown-branch.cloudflare-pages-action-a5z.pages.dev'
        }
      },
      {
        data: {
          addComment: {
            commentEdge: {
              node: {
                id: '1',
                issue: {
                  id: '1'
                }
              }
            }
          }
        }
      }
    )
    const mockData = RESPONSE_DEPLOYMENTS
      .result[0] as unknown as PagesDeployment

    expect.assertions(1)
    await expect(addComment(mockData)).resolves.not.toThrow()
    mockApi.mockAgent.assertNoPendingInterceptors()
  })
})
