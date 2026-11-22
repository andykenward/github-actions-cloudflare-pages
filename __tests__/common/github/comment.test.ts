import {info} from '@actions/core'
import {it} from '@effect/vitest'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

import type {PagesDeployment} from '@/common/cloudflare/types.js'
import type {MockApi} from '@/tests/helpers/api.js'

import {GitHubApi} from '@/common/github/api/client.js'
import {
  commentBody,
  pullRequestToComment,
  upsertComment
} from '@/common/github/comment.js'
import {GitHubContext} from '@/common/github/context.js'
import {CommonInputs} from '@/common/inputs.js'
import {CommonLayer} from '@/common/layer.js'
import {
  AddPullRequestCommentDocument,
  GetOpenPullRequestByBranchDocument,
  GetPullRequestCommentDocument,
  GetPullRequestIdDocument,
  UpdatePullRequestCommentDocument
} from '@/gql/graphql.js'
import RESPONSE_DEPLOYMENTS from '@/responses/api.cloudflare.com/pages/deployments/deployments.response.json' with {type: 'json'}
import {setMockApi} from '@/tests/helpers/api.js'

vi.mock(import('@actions/core'))

type Context = GitHubContext['Service']

/**
 * The services `pullRequestToComment` needs, with the GitHub context replaced — for
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
            sha: 'ffac537e6cbbf934b08745a378932722df287a53',
            graphqlEndpoint: 'https://api.github.com/graphql',
            apiUrl: 'https://api.github.com',
            ref: 'master',
            runUrl:
              'https://github.com/andykenward/github-actions-cloudflare-pages/actions',
            ...context
          })
        )
      )
    )
  )

// `Effect.fn` returns an anonymous function, so the title is a string.
// oxlint-disable-next-line vitest/prefer-describe-function-title
describe('pullRequestToComment', () => {
  let mockApi: MockApi

  beforeEach(() => {
    mockApi = setMockApi()
  })

  afterEach(async () => {
    mockApi.mockAgent.assertNoPendingInterceptors()
    await mockApi.mockAgent.close()
  })

  describe('eventName: pull_request', () => {
    it.effect('resolves the payload pull request', () =>
      Effect.gen(function* () {
        expect.assertions(1)

        expect(yield* pullRequestToComment()).toBe(
          'MDExOlB1bGxSZXF1ZXN0Mjc5MTQ3NDM3'
        )
      }).pipe(Effect.provide(CommonLayer))
    )

    it.effect('should not comment on a closed pull request', () => {
      vi.stubEnv(
        'GITHUB_EVENT_PATH',
        '__generated__/payloads/api.github.com/pull_request/closed.payload.json'
      )

      return Effect.gen(function* () {
        expect.assertions(1)

        // No interceptors: any GitHub request would fail the test.
        expect(yield* pullRequestToComment()).toBeUndefined()
      }).pipe(Effect.provide(CommonLayer))
    })
  })

  describe('eventName: workflow_run', () => {
    it.effect('resolves the pull request', () =>
      Effect.gen(function* () {
        expect.assertions(1)

        mockApi.interceptGithub(
          {
            query: GetPullRequestIdDocument,
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

        expect(yield* pullRequestToComment()).toBe(
          'MDExOlB1bGxSZXF1ZXN0Mjc5MTQ3NDM3'
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
                  // Only #3 matches both the head branch and sha; #4 and #5
                  // each differ in one, so each condition must be checked.
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
                    },
                    {
                      number: 4,
                      head: {
                        ref: 'master',
                        sha: 'different-sha'
                      }
                    },
                    {
                      number: 5,
                      head: {
                        ref: 'other-branch',
                        sha: '3484a3fb816e0859fd6e1cea078d76385ff50625'
                      }
                    }
                  ]
                }
              }
            },
            sha: '3484a3fb816e0859fd6e1cea078d76385ff50625'
          })
        )
      )
    )

    it.effect(
      'should fail when no workflow_run pull request matches the head branch and sha',
      () =>
        Effect.gen(function* () {
          expect.assertions(1)

          const error = yield* Effect.flip(pullRequestToComment())

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
              }
            })
          )
        )
    )

    it.effect(
      'should fail when workflow_run has multiple matching pull requests',
      () =>
        Effect.gen(function* () {
          expect.assertions(1)

          const error = yield* Effect.flip(pullRequestToComment())

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
              }
            })
          )
        )
    )
  })

  describe('pr-number input', () => {
    it.effect('should use pr-number to resolve pull request node id', () =>
      Effect.gen(function* () {
        expect.assertions(1)

        mockApi.interceptGithub(
          {
            query: GetPullRequestIdDocument,
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

        // No branch lookup: the input wins over the event.
        expect(yield* pullRequestToComment(123)).toBe(
          'MDExOlB1bGxSZXF1ZXN0Mjc5MTQ3NDM3'
        )
      }).pipe(
        Effect.provide(
          withContext({
            event: {
              eventName: 'workflow_dispatch',
              payload: {}
            },
            ref: 'refs/heads/feature-branch'
          })
        )
      )
    )

    it.effect(
      'fails with the not-found message when pr-number does not exist',
      () =>
        Effect.gen(function* () {
          expect.assertions(2)

          mockApi.interceptGithub(
            {
              query: GetPullRequestIdDocument,
              variables: {
                owner: 'andykenward',
                repo: 'github-actions-cloudflare-pages',
                number: 999
              }
            },
            {
              data: {repository: {pullRequest: null}},
              errors: [
                {
                  type: 'NOT_FOUND',
                  path: ['repository', 'pullRequest'],
                  locations: [{line: 3, column: 5}],
                  message:
                    'Could not resolve to a PullRequest with the number of 999.'
                }
              ]
            }
          )

          const error = yield* Effect.flip(pullRequestToComment(999))

          // README.md's Troubleshooting table quotes this message.
          expect(error._tag).toBe('CommentError')
          expect(error.message).toBe(
            'No pull request node id found for pr-number input: 999'
          )
        }).pipe(Effect.provide(CommonLayer))
    )

    it.effect('fails with any other GitHub error for pr-number as-is', () =>
      Effect.gen(function* () {
        expect.assertions(2)

        const errors = [
          {
            type: 'FORBIDDEN',
            path: ['repository', 'pullRequest'],
            message: 'Resource not accessible by integration'
          }
        ]
        mockApi.interceptGithub(
          {
            query: GetPullRequestIdDocument,
            variables: {
              owner: 'andykenward',
              repo: 'github-actions-cloudflare-pages',
              number: 999
            }
          },
          {data: {repository: {pullRequest: null}}, errors}
        )

        const error = yield* Effect.flip(pullRequestToComment(999))

        expect(error._tag).toBe('GitHubApiError')
        expect(error.message).toBe(JSON.stringify(errors))
      }).pipe(Effect.provide(CommonLayer))
    )
  })

  describe('eventName: workflow_dispatch', () => {
    const WORKFLOW_DISPATCH = withContext({
      event: {
        eventName: 'workflow_dispatch',
        payload: {}
      },
      branch: 'feature-branch',
      ref: 'refs/heads/feature-branch'
    })

    it.effect('resolves the pull request', () =>
      Effect.gen(function* () {
        expect.assertions(1)

        mockApi.interceptGithub(
          {
            query: GetOpenPullRequestByBranchDocument,
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

        expect(yield* pullRequestToComment()).toBe(
          'MDExOlB1bGxSZXF1ZXN0Mjc5MTQ3NDM3'
        )
      }).pipe(Effect.provide(WORKFLOW_DISPATCH))
    )

    it.effect(
      'should fail when workflow_dispatch has no matching pull request',
      () =>
        Effect.gen(function* () {
          expect.assertions(1)

          mockApi.interceptGithub(
            {
              query: GetOpenPullRequestByBranchDocument,
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

          const error = yield* Effect.flip(pullRequestToComment())

          expect(error.message).toBe(
            'No pull request node id found for workflow_dispatch event'
          )
        }).pipe(Effect.provide(WORKFLOW_DISPATCH))
    )
  })

  describe('eventName: other', () => {
    // `push` is supported but has no pull request; `issues` stands in for the
    // events `main.ts` rejects before the comment is resolved.
    it.effect.each([
      {eventName: 'push' as const},
      {eventName: 'issues' as const}
    ])('posts no comment for $eventName', ({eventName}) =>
      Effect.gen(function* () {
        expect.assertions(1)

        // No interceptors: any GitHub request would fail the test.
        expect(yield* pullRequestToComment()).toBeUndefined()
      }).pipe(
        Effect.provide(
          withContext({
            event: {
              eventName,
              payload: {}
            }
          })
        )
      )
    )
  })
})

describe(commentBody, () => {
  const deployment = RESPONSE_DEPLOYMENTS
    .result[0] as unknown as PagesDeployment
  const context = {
    sha: 'ffac537e6cbbf934b08745a378932722df287a53',
    repo: {
      owner: 'andykenward',
      repo: 'github-actions-cloudflare-pages',
      node_id: 'repo_node_id'
    },
    event: {eventName: 'push' as const, payload: {}}
  }
  const base = {environment: 'preview', projectName: 'cloudflare-pages-action'}

  test('shows a building deployment without URLs', () => {
    expect.assertions(1)

    expect(commentBody({...base, state: 'building'}, context))
      .toMatchInlineSnapshot(`
        "## Cloudflare Pages Deployment

        | Name | Result |
        | --- | --- |
        | Status | 🔄 Building |
        | Environment | preview |
        | Project | cloudflare-pages-action |
        | Commit | [\`ffac537\`](https://github.com/andykenward/github-actions-cloudflare-pages/commit/ffac537e6cbbf934b08745a378932722df287a53) |
        | Event | push |"
      `)
  })

  test('links the URLs and appends the wrangler output when ready', () => {
    expect.assertions(1)

    expect(
      commentBody(
        {...base, state: 'ready', deployment, wranglerOutput: 'success'},
        context
      )
    ).toMatchInlineSnapshot(`
      "## Cloudflare Pages Deployment

      | Name | Result |
      | --- | --- |
      | Status | ✅ Ready |
      | Environment | preview |
      | Project | cloudflare-pages-action |
      | Commit | [\`ffac537\`](https://github.com/andykenward/github-actions-cloudflare-pages/commit/ffac537e6cbbf934b08745a378932722df287a53) |
      | Event | push |
      | Preview URL | [https://206e215c.cloudflare-pages-action-a5z.pages.dev](https://206e215c.cloudflare-pages-action-a5z.pages.dev) |
      | Branch Preview URL | [https://unknown-branch.cloudflare-pages-action-a5z.pages.dev](https://unknown-branch.cloudflare-pages-action-a5z.pages.dev) |

      ### Wrangler Output
      \`\`\`
      success
      \`\`\`"
    `)
  })

  test('links the build log and escapes table cells when failed', () => {
    expect.assertions(1)

    expect(
      commentBody(
        {
          ...base,
          environment: 'a | b',
          state: 'failed',
          logUrl: 'https://dash.cloudflare.com/log'
        },
        context
      )
    ).toMatchInlineSnapshot(`
      "## Cloudflare Pages Deployment

      | Name | Result |
      | --- | --- |
      | Status | ❌ Failed |
      | Environment | a \\| b |
      | Project | cloudflare-pages-action |
      | Commit | [\`ffac537\`](https://github.com/andykenward/github-actions-cloudflare-pages/commit/ffac537e6cbbf934b08745a378932722df287a53) |
      | Event | push |
      | Build log | [View build log](https://dash.cloudflare.com/log) |"
    `)
  })

  test('notes why the action failed after a deployment went live', () => {
    expect.assertions(1)

    expect(
      commentBody(
        {...base, state: 'ready', deployment, note: 'boom\nagain'},
        context
      )
    ).toContain('\n\n> boom again')
  })
})

// `Effect.fn` returns an anonymous function, so the title is a string.
// oxlint-disable-next-line vitest/prefer-describe-function-title
describe('upsertComment', () => {
  const PULL_REQUEST_ID = 'PR_kwDOJn0nrM5vY7Xq'
  const COMMENT_ID = 'IC_kwDOJn0nrM5vY7Xq'
  let mockApi: MockApi

  beforeEach(() => {
    mockApi = setMockApi()
  })

  afterEach(async () => {
    mockApi.mockAgent.assertNoPendingInterceptors()
    await mockApi.mockAgent.close()
  })

  const interceptAdd = () =>
    mockApi.interceptGithub(
      {
        query: AddPullRequestCommentDocument,
        variables: {input: {subjectId: PULL_REQUEST_ID, body: 'body'}}
      },
      {data: {addComment: {commentEdge: {node: {id: 'IC_new'}}}}}
    )

  const interceptLookup = (response: object) =>
    mockApi.interceptGithub(
      {query: GetPullRequestCommentDocument, variables: {id: COMMENT_ID}},
      response
    )

  it.effect('posts nothing without a pull request', () =>
    Effect.gen(function* () {
      expect.assertions(2)

      expect(
        yield* upsertComment(undefined, COMMENT_ID, 'body')
      ).toBeUndefined()
      expect(info).toHaveBeenCalledWith(
        'comment - No Pull Request could be found to post comment.'
      )
    }).pipe(Effect.provide(CommonLayer))
  )

  it.effect('posts a new comment when there is no previous one', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      interceptAdd()

      expect(yield* upsertComment(PULL_REQUEST_ID, undefined, 'body')).toBe(
        'IC_new'
      )
    }).pipe(Effect.provide(CommonLayer))
  )

  it.effect('edits the previous comment on the same pull request', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      interceptLookup({
        data: {node: {id: COMMENT_ID, pullRequest: {id: PULL_REQUEST_ID}}}
      })
      mockApi.interceptGithub(
        {
          query: UpdatePullRequestCommentDocument,
          variables: {input: {id: COMMENT_ID, body: 'body'}}
        },
        {data: {updateIssueComment: {issueComment: {id: COMMENT_ID}}}}
      )

      expect(yield* upsertComment(PULL_REQUEST_ID, COMMENT_ID, 'body')).toBe(
        COMMENT_ID
      )
    }).pipe(Effect.provide(CommonLayer))
  )

  it.effect.each([
    {
      reason: 'is on another pull request',
      response: {
        data: {node: {id: COMMENT_ID, pullRequest: {id: 'PR_other'}}}
      }
    },
    {
      reason: 'was deleted',
      response: {
        data: {node: null},
        errors: [
          {
            type: 'NOT_FOUND',
            path: ['node'],
            message: `Could not resolve to a node with the global id of '${COMMENT_ID}'`
          }
        ]
      }
    }
  ])('posts a new comment when the previous one $reason', ({response}) =>
    Effect.gen(function* () {
      expect.assertions(1)

      interceptLookup(response)
      interceptAdd()

      expect(yield* upsertComment(PULL_REQUEST_ID, COMMENT_ID, 'body')).toBe(
        'IC_new'
      )
    }).pipe(Effect.provide(CommonLayer))
  )

  it.effect('fails with any other error looking up the previous comment', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      interceptLookup({
        data: {node: null},
        errors: [{type: 'FORBIDDEN', path: ['node'], message: 'forbidden'}]
      })

      const error = yield* Effect.flip(
        upsertComment(PULL_REQUEST_ID, COMMENT_ID, 'body')
      )

      expect(error._tag).toBe('GitHubApiError')
    }).pipe(Effect.provide(CommonLayer))
  )
})
