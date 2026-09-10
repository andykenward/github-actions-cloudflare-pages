import {error, notice, setFailed} from '@actions/core'
import {it} from '@effect/vitest'
import * as Effect from 'effect/Effect'
import {afterEach, beforeEach, describe, expect, vi} from 'vitest'

import type {GitHubGraphQLError} from '@/common/github/api/client.js'
import type {GetEnvironmentQuery} from '@/gql/graphql.js'
import type {MockApi} from '@/tests/helpers/api.js'

import {
  checkEnvironment,
  createEnvironment,
  MutationCreateEnvironment,
  QueryGetEnvironment
} from '@/common/github/environment.js'
import {CommonLayer} from '@/common/layer.js'
import {getMockApi} from '@/tests/helpers/api.js'
import {TEST_ENV_VARS} from '@/tests/helpers/env.js'

vi.mock(import('@actions/core'))

describe('environment', () => {
  let mockApi: MockApi

  const mockQueryGetEnvironment = (
    data: GetEnvironmentQuery,
    errors?: GitHubGraphQLError[]
  ): void => {
    mockApi.interceptGithub(
      {
        query: QueryGetEnvironment,
        variables: {
          owner: 'andykenward',
          repo: 'github-actions-cloudflare-pages',
          environment_name: 'mock-github-environment',
          qualifiedName: 'mock-github-head-ref'
        }
      },
      {
        data,
        errors
      }
    )
  }

  beforeEach(() => {
    mockApi = getMockApi()
  })

  afterEach(async () => {
    mockApi.mockAgent.assertNoPendingInterceptors()
    await mockApi.mockAgent.close()
  })

  // An Effect value, not a function, so the title is a string.
  // oxlint-disable-next-line vitest/prefer-describe-function-title
  describe('createEnvironment', () => {
    it.effect('fails with a clear error on a non-2xx response', () =>
      Effect.gen(function* () {
        expect.assertions(1)

        // GitHub returns JSON for a 401, so this previously parsed cleanly,
        // carried no `errors` field, and silently produced `data: undefined`.
        mockApi.interceptGithub(
          {
            query: MutationCreateEnvironment,
            variables: {
              repositoryId: `MDEwOlJlcG9zaXRvcnkxODY4NTMwMDI=`,
              name: TEST_ENV_VARS().GITHUB_HEAD_REF as string
            }
          },
          {data: {}} as never,
          401
        )

        const failure = yield* Effect.flip(createEnvironment)

        expect(failure.message).toContain('GitHub API request failed: 401')
      }).pipe(Effect.provide(CommonLayer))
    )

    it.effect('success', () =>
      Effect.gen(function* () {
        expect.assertions(3)

        mockApi.interceptGithub(
          {
            query: MutationCreateEnvironment,
            variables: {
              repositoryId: `MDEwOlJlcG9zaXRvcnkxODY4NTMwMDI=`,
              name: TEST_ENV_VARS().GITHUB_HEAD_REF as string
            }
          },
          {
            data: {
              createEnvironment: {
                environment: {
                  name: 'unlike-dev (Preview)',
                  id: 'EN_kwDOJn0nrM5D_l8n'
                }
              }
            }
          }
        )

        const environment = yield* createEnvironment

        expect(error).not.toHaveBeenCalled()
        expect(notice).not.toHaveBeenCalled()
        expect(environment).toMatchInlineSnapshot(`
          {
            "id": "EN_kwDOJn0nrM5D_l8n",
            "name": "unlike-dev (Preview)",
          }
        `)
      }).pipe(Effect.provide(CommonLayer))
    )

    it.effect('logs errors & missing environment', () =>
      Effect.gen(function* () {
        expect.assertions(3)

        mockApi.interceptGithub(
          {
            query: MutationCreateEnvironment,
            variables: {
              repositoryId: `MDEwOlJlcG9zaXRvcnkxODY4NTMwMDI=`,
              name: TEST_ENV_VARS().GITHUB_HEAD_REF as string
            }
          },
          {
            data: {
              createEnvironment: {
                environment: null
              }
            },
            errors: [
              {
                type: 'NOT_FOUND',
                path: ['createEnvironment'],
                locations: [
                  {
                    line: 22,
                    column: 5
                  }
                ],
                message: 'some error message'
              }
            ]
          }
        )

        const environment = yield* createEnvironment

        expect(error).toHaveBeenCalledWith(
          `GitHub Environment: Errors - ${JSON.stringify([
            {
              type: 'NOT_FOUND',
              path: ['createEnvironment'],
              locations: [
                {
                  line: 22,
                  column: 5
                }
              ],
              message: 'some error message'
            }
          ])}`
        )
        expect(notice).toHaveBeenCalledWith('GitHub Environment: Not created')
        expect(environment).toBeNull()
      }).pipe(Effect.provide(CommonLayer))
    )
  })

  // oxlint-disable-next-line vitest/prefer-describe-function-title
  describe('checkEnvironment', () => {
    it.effect('success', () =>
      Effect.gen(function* () {
        expect.assertions(4)

        mockQueryGetEnvironment({
          repository: {
            environment: {
              name: 'unlike-dev (Preview)',
              id: 'EN_kwDOJn0nrM5D_l8n'
            },
            ref: {
              id: 'MDg6Q2hlY2tSdW4xMjM0NTY3ODk='
            }
          }
        })

        const environment = yield* checkEnvironment

        expect(error).not.toHaveBeenCalled()
        expect(setFailed).not.toHaveBeenCalled()
        expect(notice).not.toHaveBeenCalled()
        expect(environment).toMatchInlineSnapshot(`
          {
            "id": "EN_kwDOJn0nrM5D_l8n",
            "name": "unlike-dev (Preview)",
            "refId": "MDg6Q2hlY2tSdW4xMjM0NTY3ODk=",
          }
        `)
      }).pipe(Effect.provide(CommonLayer))
    )

    const RESPONSES: Array<{
      response: Parameters<typeof mockQueryGetEnvironment>
      expected: string
    }> = [
      {
        response: [
          {
            repository: {
              environment: null,
              ref: null
            }
          },
          [
            {
              type: 'NOT_FOUND',
              path: ['getEnvironment'],
              locations: [
                {
                  line: 22,
                  column: 5
                }
              ],
              message: 'some error message'
            }
          ]
        ],
        expected: `GitHub Environment: Errors - ${JSON.stringify([
          {
            type: 'NOT_FOUND',
            path: ['getEnvironment'],
            locations: [
              {
                line: 22,
                column: 5
              }
            ],
            message: 'some error message'
          }
        ])}`
      },
      {
        response: [
          {
            repository: {
              environment: null,
              ref: {
                id: 'MDg6Q2hlY2tSdW4xMjM0NTY3ODk='
              }
            }
          }
        ],
        expected: `GitHub Environment: Not created for mock-github-environment`
      },
      {
        response: [
          {
            repository: {
              environment: {
                name: 'unlike-dev (Preview)',
                id: 'EN_kwDOJn0nrM5D_l8n'
              },
              ref: null
            }
          }
        ],
        expected: `GitHub Environment: No ref id mock-github-environment`
      }
    ]

    it.effect.each(RESPONSES)(
      `fails without calling setFailed`,
      ({response, expected}) =>
        Effect.gen(function* () {
          expect.assertions(2)

          mockQueryGetEnvironment(...response)

          const failure = yield* Effect.flip(checkEnvironment)

          expect(failure.message).toBe(expected)
          // The entry point's `reportFailure` fails the step once; calling it
          // here too produced a duplicate error annotation.
          expect(setFailed).not.toHaveBeenCalled()
        }).pipe(Effect.provide(CommonLayer))
    )
  })
})
