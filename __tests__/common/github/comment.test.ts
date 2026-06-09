import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

import type {PagesDeployment} from '@/common/cloudflare/types.js'
import type {WorkflowEventExtract} from '@/common/github/workflow-event/types.js'
import type {MockApi} from '@/tests/helpers/api.js'

import {
  addComment,
  MutationAddComment,
  MutationUpdateComment,
  QueryPullRequestComments,
  QueryPullRequestNodeId,
  QueryPullRequestNodeIdByBranch
} from '@/common/github/comment.js'
import * as Context from '@/common/github/context.js'
import * as CommonInputs from '@/common/inputs.js'
import RESPONSE_DEPLOYMENTS from '@/responses/api.cloudflare.com/pages/deployments/deployments.response.json' with {type: 'json'}
import {setMockApi} from '@/tests/helpers/api.js'
import {EVENT_NAMES} from '@/types/github/workflow-events.js'

vi.mock(import('@actions/core'))

describe(addComment, () => {
  const mockData = RESPONSE_DEPLOYMENTS.result[0] as unknown as PagesDeployment
  let mockApi: MockApi

  beforeEach(() => {
    mockApi = setMockApi()
  })

  afterEach(async () => {
    mockApi.mockAgent.assertNoPendingInterceptors()
    await mockApi.mockAgent.close()
  })

  describe('eventName: pull_request', () => {
    test('should add comment', async () => {
      expect.assertions(1)

      mockApi.interceptGithub(
        {
          query: MutationAddComment,
          variables: {
            subjectId: 'MDExOlB1bGxSZXF1ZXN0Mjc5MTQ3NDM3',
            body: '<!-- cloudflare-pages-deployment-comment -->\n## Cloudflare Pages Deployment\n**Event Name:** pull_request\n**Environment:** production\n**Project:** cloudflare-pages-action\n**Built with commit:** mock-github-sha\n**Preview URL:** https://206e215c.cloudflare-pages-action-a5z.pages.dev\n**Branch Preview URL:** https://unknown-branch.cloudflare-pages-action-a5z.pages.dev\n\n### Wrangler Output\nsuccess'
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
  })

  describe('eventName: workflow_run', () => {
    test('should add comment', async () => {
      expect.assertions(1)

      vi.spyOn(Context, 'useContextEvent').mockReturnValue({
        eventName: 'workflow_run',
        payload: {
          workflow_run: {
            head_branch: 'master',
            head_sha: '3484a3fb816e0859fd6e1cea078d76385ff50625',
            pull_requests: [
              {
                number: 2,
                head: {
                  ref: 'other-branch',
                  sha: 'different-sha'
                }
              },
              {
                number: 3,
                head: {
                  ref: 'master',
                  sha: '3484a3fb816e0859fd6e1cea078d76385ff50625'
                }
              }
            ]
          }
        }
      } as Readonly<WorkflowEventExtract<'workflow_run'>>)

      vi.spyOn(Context, 'useContext').mockReturnValue({
        event: {
          eventName: 'workflow_run',
          payload: {} as never
        },
        repo: {
          owner: 'andykenward',
          repo: 'github-actions-cloudflare-pages',
          node_id: 'repo_node_id'
        },
        branch: 'master',
        sha: '3484a3fb816e0859fd6e1cea078d76385ff50625',
        graphqlEndpoint: 'https://api.github.com/graphql',
        ref: 'master'
      } as unknown as ReturnType<typeof Context.useContext>)

      mockApi.interceptGithub(
        {
          query: QueryPullRequestNodeId,
          variables: {
            owner: 'andykenward',
            repo: 'github-actions-cloudflare-pages',
            number: 3
          }
        },
        {
          data: {
            repository: {
              pullRequest: {
                id: 'MDExOlB1bGxSZXF1ZXN0Mjc5MTQ3NDM3'
              }
            }
          }
        }
      )

      mockApi.interceptGithub(
        {
          query: MutationAddComment,
          variables: {
            subjectId: 'MDExOlB1bGxSZXF1ZXN0Mjc5MTQ3NDM3',
            body: '<!-- cloudflare-pages-deployment-comment -->\n## Cloudflare Pages Deployment\n**Event Name:** workflow_run\n**Environment:** production\n**Project:** cloudflare-pages-action\n**Built with commit:** 3484a3fb816e0859fd6e1cea078d76385ff50625\n**Preview URL:** https://206e215c.cloudflare-pages-action-a5z.pages.dev\n**Branch Preview URL:** https://unknown-branch.cloudflare-pages-action-a5z.pages.dev\n\n### Wrangler Output\nsuccess'
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

    test('should throw when workflow_run has no pull request number', async () => {
      expect.assertions(1)

      vi.spyOn(Context, 'useContextEvent').mockReturnValue({
        eventName: 'workflow_run',
        payload: {
          workflow_run: {
            head_branch: 'master',
            head_sha: '3484a3fb816e0859fd6e1cea078d76385ff50625',
            pull_requests: []
          }
        }
      } as unknown as Readonly<WorkflowEventExtract<'workflow_run'>>)

      await expect(addComment(mockData, 'success')).rejects.toThrow(
        'No pull request found in workflow_run event matching head branch and sha'
      )
    })

    test('should throw when workflow_run has multiple matching pull requests', async () => {
      expect.assertions(1)

      vi.spyOn(Context, 'useContextEvent').mockReturnValue({
        eventName: 'workflow_run',
        payload: {
          workflow_run: {
            head_branch: 'master',
            head_sha: '3484a3fb816e0859fd6e1cea078d76385ff50625',
            pull_requests: [
              {
                number: 2,
                head: {
                  ref: 'master',
                  sha: '3484a3fb816e0859fd6e1cea078d76385ff50625'
                }
              },
              {
                number: 3,
                head: {
                  ref: 'master',
                  sha: '3484a3fb816e0859fd6e1cea078d76385ff50625'
                }
              }
            ]
          }
        }
      } as unknown as Readonly<WorkflowEventExtract<'workflow_run'>>)

      await expect(addComment(mockData, 'success')).rejects.toThrow(
        'Multiple pull requests found in workflow_run event matching head branch and sha'
      )
    })
  })

  describe('pr-number input', () => {
    test('should use pr-number to resolve pull request node id', async () => {
      expect.assertions(1)

      vi.spyOn(CommonInputs, 'useCommonInputs').mockReturnValueOnce({
        cloudflareApiToken: 'mock-cloudflare-api-token',
        gitHubApiToken: 'mock-github-token',
        gitHubEnvironment: undefined,
        prNumber: '123',
        wranglerVersion: 'mock-wrangler-version',
        commentMode: 'new',
        hideWranglerOutput: false
      })

      vi.spyOn(Context, 'useContextEvent').mockReturnValue({
        eventName: 'workflow_dispatch',
        payload: {}
      } as Readonly<WorkflowEventExtract<'workflow_dispatch'>>)

      vi.spyOn(Context, 'useContext').mockReturnValue({
        event: {
          eventName: 'workflow_dispatch',
          payload: {} as never
        },
        repo: {
          owner: 'andykenward',
          repo: 'github-actions-cloudflare-pages',
          node_id: 'repo_node_id'
        },
        branch: undefined,
        sha: 'mock-github-sha',
        graphqlEndpoint: 'https://api.github.com/graphql',
        ref: 'refs/heads/feature-branch'
      } as unknown as ReturnType<typeof Context.useContext>)

      mockApi.interceptGithub(
        {
          query: QueryPullRequestNodeId,
          variables: {
            owner: 'andykenward',
            repo: 'github-actions-cloudflare-pages',
            number: 123
          }
        },
        {
          data: {
            repository: {
              pullRequest: {
                id: 'MDExOlB1bGxSZXF1ZXN0Mjc5MTQ3NDM3'
              }
            }
          }
        }
      )

      mockApi.interceptGithub(
        {
          query: MutationAddComment,
          variables: {
            subjectId: 'MDExOlB1bGxSZXF1ZXN0Mjc5MTQ3NDM3',
            body: '<!-- cloudflare-pages-deployment-comment -->\n## Cloudflare Pages Deployment\n**Event Name:** workflow_dispatch\n**Environment:** production\n**Project:** cloudflare-pages-action\n**Built with commit:** mock-github-sha\n**Preview URL:** https://206e215c.cloudflare-pages-action-a5z.pages.dev\n**Branch Preview URL:** https://unknown-branch.cloudflare-pages-action-a5z.pages.dev\n\n### Wrangler Output\nsuccess'
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

    test('should throw for invalid pr-number input', async () => {
      expect.assertions(1)

      vi.spyOn(CommonInputs, 'useCommonInputs').mockReturnValueOnce({
        cloudflareApiToken: 'mock-cloudflare-api-token',
        gitHubApiToken: 'mock-github-token',
        gitHubEnvironment: undefined,
        prNumber: 'abc',
        wranglerVersion: 'mock-wrangler-version',
        commentMode: 'new',
        hideWranglerOutput: false
      })

      await expect(addComment(mockData, 'success')).rejects.toThrow(
        'Invalid pr-number input: abc'
      )
    })
  })

  describe('eventName: workflow_dispatch', () => {
    test('should add comment', async () => {
      expect.assertions(1)

      vi.spyOn(Context, 'useContextEvent').mockReturnValue({
        eventName: 'workflow_dispatch',
        payload: {}
      } as Readonly<WorkflowEventExtract<'workflow_dispatch'>>)

      vi.spyOn(Context, 'useContext').mockReturnValue({
        event: {
          eventName: 'workflow_dispatch',
          payload: {} as never
        },
        repo: {
          owner: 'andykenward',
          repo: 'github-actions-cloudflare-pages',
          node_id: 'repo_node_id'
        },
        branch: 'feature-branch',
        sha: 'mock-github-sha',
        graphqlEndpoint: 'https://api.github.com/graphql',
        ref: 'refs/heads/feature-branch'
      } as unknown as ReturnType<typeof Context.useContext>)

      mockApi.interceptGithub(
        {
          query: QueryPullRequestNodeIdByBranch,
          variables: {
            owner: 'andykenward',
            repo: 'github-actions-cloudflare-pages',
            headRefName: 'feature-branch'
          }
        },
        {
          data: {
            repository: {
              pullRequests: {
                nodes: [{id: 'MDExOlB1bGxSZXF1ZXN0Mjc5MTQ3NDM3'}]
              }
            }
          }
        }
      )

      mockApi.interceptGithub(
        {
          query: MutationAddComment,
          variables: {
            subjectId: 'MDExOlB1bGxSZXF1ZXN0Mjc5MTQ3NDM3',
            body: '<!-- cloudflare-pages-deployment-comment -->\n## Cloudflare Pages Deployment\n**Event Name:** workflow_dispatch\n**Environment:** production\n**Project:** cloudflare-pages-action\n**Built with commit:** mock-github-sha\n**Preview URL:** https://206e215c.cloudflare-pages-action-a5z.pages.dev\n**Branch Preview URL:** https://unknown-branch.cloudflare-pages-action-a5z.pages.dev\n\n### Wrangler Output\nsuccess'
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

    test('should throw when workflow_dispatch has no matching pull request', async () => {
      expect.assertions(1)

      vi.spyOn(Context, 'useContextEvent').mockReturnValue({
        eventName: 'workflow_dispatch',
        payload: {}
      } as Readonly<WorkflowEventExtract<'workflow_dispatch'>>)

      vi.spyOn(Context, 'useContext').mockReturnValue({
        event: {
          eventName: 'workflow_dispatch',
          payload: {} as never
        },
        repo: {
          owner: 'andykenward',
          repo: 'github-actions-cloudflare-pages',
          node_id: 'repo_node_id'
        },
        branch: 'feature-branch',
        sha: 'mock-github-sha',
        graphqlEndpoint: 'https://api.github.com/graphql',
        ref: 'refs/heads/feature-branch'
      } as unknown as ReturnType<typeof Context.useContext>)

      mockApi.interceptGithub(
        {
          query: QueryPullRequestNodeIdByBranch,
          variables: {
            owner: 'andykenward',
            repo: 'github-actions-cloudflare-pages',
            headRefName: 'feature-branch'
          }
        },
        {
          data: {
            repository: {
              pullRequests: {
                nodes: []
              }
            }
          }
        }
      )

      await expect(addComment(mockData, 'success')).rejects.toThrow(
        'No pull request node id found for workflow_dispatch event'
      )
    })
  })

  describe('eventName: unsupported', () => {
    const eventNames = EVENT_NAMES.filter(
      eventName =>
        eventName !== 'pull_request' &&
        eventName !== 'workflow_dispatch' &&
        eventName !== 'workflow_run'
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

  describe('comment-mode: update', () => {
    test('should update existing comment when comment-mode is update', async () => {
      expect.assertions(1)

      vi.spyOn(CommonInputs, 'useCommonInputs').mockReturnValue({
        cloudflareApiToken: 'mock-cloudflare-api-token',
        gitHubApiToken: 'mock-github-token',
        gitHubEnvironment: undefined,
        prNumber: undefined,
        wranglerVersion: 'mock-wrangler-version',
        commentMode: 'update',
        hideWranglerOutput: false
      })

      // Mock finding existing comment
      mockApi.interceptGithub(
        {
          query: QueryPullRequestComments,
          variables: {
            prNodeId: 'MDExOlB1bGxSZXF1ZXN0Mjc5MTQ3NDM3',
            first: 50
          }
        },
        {
          data: {
            node: {
              comments: {
                nodes: [
                  {
                    id: 'existing-comment-id',
                    body: '<!-- cloudflare-pages-deployment-comment -->\n## Old deployment',
                    author: {
                      login: 'github-actions[bot]'
                    }
                  }
                ]
              }
            }
          }
        }
      )

      // Mock updating the comment
      mockApi.interceptGithub(
        {
          query: MutationUpdateComment,
          variables: {
            id: 'existing-comment-id',
            body: '<!-- cloudflare-pages-deployment-comment -->\n## Cloudflare Pages Deployment\n**Event Name:** pull_request\n**Environment:** production\n**Project:** cloudflare-pages-action\n**Built with commit:** mock-github-sha\n**Preview URL:** https://206e215c.cloudflare-pages-action-a5z.pages.dev\n**Branch Preview URL:** https://unknown-branch.cloudflare-pages-action-a5z.pages.dev\n\n### Wrangler Output\nsuccess'
          }
        },
        {
          data: {
            updateIssueComment: {
              issueComment: {
                id: 'existing-comment-id'
              }
            }
          }
        }
      )

      const comment = await addComment(mockData, 'success')

      expect(comment).toBe('existing-comment-id')
    })

    test('should create new comment when no existing comment found in update mode', async () => {
      expect.assertions(1)

      vi.spyOn(CommonInputs, 'useCommonInputs').mockReturnValue({
        cloudflareApiToken: 'mock-cloudflare-api-token',
        gitHubApiToken: 'mock-github-token',
        gitHubEnvironment: undefined,
        prNumber: undefined,
        wranglerVersion: 'mock-wrangler-version',
        commentMode: 'update',
        hideWranglerOutput: false
      })

      // Mock finding no existing comments
      mockApi.interceptGithub(
        {
          query: QueryPullRequestComments,
          variables: {
            prNodeId: 'MDExOlB1bGxSZXF1ZXN0Mjc5MTQ3NDM3',
            first: 50
          }
        },
        {
          data: {
            node: {
              comments: {
                nodes: []
              }
            }
          }
        }
      )

      // Mock creating new comment
      mockApi.interceptGithub(
        {
          query: MutationAddComment,
          variables: {
            subjectId: 'MDExOlB1bGxSZXF1ZXN0Mjc5MTQ3NDM3',
            body: '<!-- cloudflare-pages-deployment-comment -->\n## Cloudflare Pages Deployment\n**Event Name:** pull_request\n**Environment:** production\n**Project:** cloudflare-pages-action\n**Built with commit:** mock-github-sha\n**Preview URL:** https://206e215c.cloudflare-pages-action-a5z.pages.dev\n**Branch Preview URL:** https://unknown-branch.cloudflare-pages-action-a5z.pages.dev\n\n### Wrangler Output\nsuccess'
          }
        },
        {
          data: {
            addComment: {
              commentEdge: {
                node: {
                  id: 'new-comment-id'
                }
              }
            }
          }
        }
      )

      const comment = await addComment(mockData, 'success')

      expect(comment).toBe('new-comment-id')
    })
  })

  describe('hide-wrangler-output', () => {
    test('should hide wrangler output when hideWranglerOutput is true', async () => {
      expect.assertions(1)

      vi.spyOn(CommonInputs, 'useCommonInputs').mockReturnValue({
        cloudflareApiToken: 'mock-cloudflare-api-token',
        gitHubApiToken: 'mock-github-token',
        gitHubEnvironment: undefined,
        prNumber: undefined,
        wranglerVersion: 'mock-wrangler-version',
        commentMode: 'new',
        hideWranglerOutput: true
      })

      mockApi.interceptGithub(
        {
          query: MutationAddComment,
          variables: {
            subjectId: 'MDExOlB1bGxSZXF1ZXN0Mjc5MTQ3NDM3',
            body: '<!-- cloudflare-pages-deployment-comment -->\n## Cloudflare Pages Deployment\n**Event Name:** pull_request\n**Environment:** production\n**Project:** cloudflare-pages-action\n**Built with commit:** mock-github-sha\n**Preview URL:** https://206e215c.cloudflare-pages-action-a5z.pages.dev\n**Branch Preview URL:** https://unknown-branch.cloudflare-pages-action-a5z.pages.dev'
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
  })
})
