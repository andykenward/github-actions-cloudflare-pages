import {it} from '@effect/vitest'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import {afterEach, beforeEach, describe, expect, vi} from 'vitest'

import type {PagesDeployment} from '@/common/cloudflare/types.js'
import type {WorkflowEventExtract} from '@/common/github/workflow-event/types.js'
import type {MockApi} from '@/tests/helpers/api.js'

import {GitHubApi} from '@/common/github/api/client.js'
import {
  addComment,
  MutationAddComment,
  pullRequestToComment,
  QueryPullRequestNodeId,
  QueryPullRequestNodeIdByBranch
} from '@/common/github/comment.js'
import {GitHubContext} from '@/common/github/context.js'
import {CommonInputs} from '@/common/inputs.js'
import {CommonLayer} from '@/common/layer.js'
import {INPUT_KEY_PR_NUMBER} from '@/input-keys'
import RESPONSE_DEPLOYMENTS from '@/responses/api.cloudflare.com/pages/deployments/deployments.response.json' with {type: 'json'}
import {setMockApi} from '@/tests/helpers/api.js'
import {stubInputEnv} from '@/tests/helpers/inputs.js'
import {EVENT_NAMES} from '@/types/github/workflow-events.js'

vi.mock(import('@actions/core'))

type Context = GitHubContext['Service']

/** Resolves the pull request, then comments on it — as the deploy does. */
const comment = (deployment: PagesDeployment, output: string) =>
  pullRequestToComment.pipe(
    Effect.flatMap(pullRequestId =>
      addComment(pullRequestId, deployment, output)
    )
  )

/**
 * The services `addComment` needs, with the GitHub context replaced — for
 * events and pull request lists the payload fixtures don't cover.
 */
const withContext = (context: Pick<Context, 'event'> & Partial<Context>) =>
  GitHubApi.layer.pipe(
    Layer.provideMerge(
      Layer.mergeAll(
        CommonInputs.layer,
        Layer.succeed(
          GitHubContext,
          GitHubContext.of({
            repo: {
              owner: 'andykenward',
              repo: 'github-actions-cloudflare-pages',
              node_id: 'repo_node_id'
            },
            branch: 'master',
            sha: 'mock-github-sha',
            graphqlEndpoint: 'https://api.github.com/graphql',
            ref: 'master',
            ...context
          })
        )
      )
    )
  )

// `Effect.fn` returns an anonymous function, so the title is a string.
// oxlint-disable-next-line vitest/prefer-describe-function-title
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

  describe('eventName: pull_request', () => {
    it.effect('should add comment', () =>
      Effect.gen(function* () {
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

        expect(yield* comment(mockData, 'success')).toBe('1')
      }).pipe(Effect.provide(CommonLayer))
    )
  })

  describe('eventName: workflow_run', () => {
    it.effect('should add comment', () =>
      Effect.gen(function* () {
        expect.assertions(1)

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
              body: '## Cloudflare Pages Deployment\n**Event Name:** workflow_run\n**Environment:** production\n**Project:** cloudflare-pages-action\n**Built with commit:** 3484a3fb816e0859fd6e1cea078d76385ff50625\n**Preview URL:** https://206e215c.cloudflare-pages-action-a5z.pages.dev\n**Branch Preview URL:** https://unknown-branch.cloudflare-pages-action-a5z.pages.dev\n\n### Wrangler Output\nsuccess'
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

        expect(yield* comment(mockData, 'success')).toBe('1')
      }).pipe(
        Effect.provide(
          withContext({
            event: {
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
            } as Readonly<WorkflowEventExtract<'workflow_run'>>,
            sha: '3484a3fb816e0859fd6e1cea078d76385ff50625'
          })
        )
      )
    )

    it.effect('should fail when workflow_run has no pull request number', () =>
      Effect.gen(function* () {
        expect.assertions(1)

        const error = yield* Effect.flip(comment(mockData, 'success'))

        expect(error.message).toBe(
          'No pull request found in workflow_run event matching head branch and sha'
        )
      }).pipe(
        Effect.provide(
          withContext({
            event: {
              eventName: 'workflow_run',
              payload: {
                workflow_run: {
                  head_branch: 'master',
                  head_sha: '3484a3fb816e0859fd6e1cea078d76385ff50625',
                  pull_requests: []
                }
              }
            } as unknown as Readonly<WorkflowEventExtract<'workflow_run'>>
          })
        )
      )
    )

    it.effect(
      'should fail when workflow_run has multiple matching pull requests',
      () =>
        Effect.gen(function* () {
          expect.assertions(1)

          const error = yield* Effect.flip(comment(mockData, 'success'))

          expect(error.message).toBe(
            'Multiple pull requests found in workflow_run event matching head branch and sha'
          )
        }).pipe(
          Effect.provide(
            withContext({
              event: {
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
              } as unknown as Readonly<WorkflowEventExtract<'workflow_run'>>
            })
          )
        )
    )
  })

  describe('pr-number input', () => {
    it.effect('should use pr-number to resolve pull request node id', () => {
      stubInputEnv(INPUT_KEY_PR_NUMBER, '123')

      return Effect.gen(function* () {
        expect.assertions(1)

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
              body: '## Cloudflare Pages Deployment\n**Event Name:** workflow_dispatch\n**Environment:** production\n**Project:** cloudflare-pages-action\n**Built with commit:** mock-github-sha\n**Preview URL:** https://206e215c.cloudflare-pages-action-a5z.pages.dev\n**Branch Preview URL:** https://unknown-branch.cloudflare-pages-action-a5z.pages.dev\n\n### Wrangler Output\nsuccess'
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

        expect(yield* comment(mockData, 'success')).toBe('1')
      }).pipe(
        Effect.provide(
          withContext({
            event: {
              eventName: 'workflow_dispatch',
              payload: {}
            } as Readonly<WorkflowEventExtract<'workflow_dispatch'>>,
            branch: undefined,
            ref: 'refs/heads/feature-branch'
          })
        )
      )
    })

    it.effect('should fail for invalid pr-number input', () => {
      stubInputEnv(INPUT_KEY_PR_NUMBER, 'abc')

      return Effect.gen(function* () {
        expect.assertions(1)

        const error = yield* Effect.flip(comment(mockData, 'success'))

        expect(error.message).toBe('Invalid pr-number input: abc')
      }).pipe(Effect.provide(CommonLayer))
    })
  })

  describe('eventName: workflow_dispatch', () => {
    const WORKFLOW_DISPATCH = withContext({
      event: {
        eventName: 'workflow_dispatch',
        payload: {}
      } as Readonly<WorkflowEventExtract<'workflow_dispatch'>>,
      branch: 'feature-branch',
      ref: 'refs/heads/feature-branch'
    })

    it.effect('should add comment', () =>
      Effect.gen(function* () {
        expect.assertions(1)

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
              body: '## Cloudflare Pages Deployment\n**Event Name:** workflow_dispatch\n**Environment:** production\n**Project:** cloudflare-pages-action\n**Built with commit:** mock-github-sha\n**Preview URL:** https://206e215c.cloudflare-pages-action-a5z.pages.dev\n**Branch Preview URL:** https://unknown-branch.cloudflare-pages-action-a5z.pages.dev\n\n### Wrangler Output\nsuccess'
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

        expect(yield* comment(mockData, 'success')).toBe('1')
      }).pipe(Effect.provide(WORKFLOW_DISPATCH))
    )

    it.effect(
      'should fail when workflow_dispatch has no matching pull request',
      () =>
        Effect.gen(function* () {
          expect.assertions(1)

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

          const error = yield* Effect.flip(comment(mockData, 'success'))

          expect(error.message).toBe(
            'No pull request node id found for workflow_dispatch event'
          )
        }).pipe(Effect.provide(WORKFLOW_DISPATCH))
    )
  })

  describe('eventName: unsupported', () => {
    const eventNames = EVENT_NAMES.filter(
      eventName =>
        eventName !== 'pull_request' &&
        eventName !== 'workflow_dispatch' &&
        eventName !== 'workflow_run'
    )

    it.effect.each(eventNames.map(eventName => ({eventName})))(
      `should return undefined for eventName: $eventName`,
      ({eventName}) =>
        Effect.gen(function* () {
          expect.assertions(2)
          expect(EVENT_NAMES).toContain(eventName)

          expect(yield* comment(mockData, 'success')).toBeUndefined()
        }).pipe(
          Effect.provide(
            withContext({
              event: {
                eventName,
                payload: {}
              } as Readonly<WorkflowEventExtract<typeof eventName>>
            })
          )
        )
    )
  })
})
