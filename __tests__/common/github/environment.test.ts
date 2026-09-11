import {setFailed} from '@actions/core'
import {it} from '@effect/vitest'
import * as Effect from 'effect/Effect'
import {afterEach, beforeEach, describe, expect, vi} from 'vitest'

import type {GitHubGraphQLError} from '@/common/github/api/client.js'
import type {GetEnvironmentAndRefQuery} from '@/gql/graphql.js'
import type {MockApi} from '@/tests/helpers/api.js'

import {checkEnvironment} from '@/common/github/environment.js'
import {CommonLayer} from '@/common/layer.js'
import {GetEnvironmentAndRefDocument} from '@/gql/graphql.js'
import {INPUT_KEY_GITHUB_ENVIRONMENT} from '@/input-keys'
import {getMockApi} from '@/tests/helpers/api.js'
import {stubInputEnv} from '@/tests/helpers/inputs.js'

vi.mock(import('@actions/core'))

describe('environment', () => {
  let mockApi: MockApi

  const mockQueryGetEnvironment = (
    data: GetEnvironmentAndRefQuery,
    errors?: GitHubGraphQLError[]
  ): void => {
    mockApi.interceptGithub(
      {
        query: GetEnvironmentAndRefDocument,
        variables: {
          owner: 'andykenward',
          repo: 'github-actions-cloudflare-pages',
          environmentName: 'mock-github-environment',
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
  describe('checkEnvironment', () => {
    it.effect(
      'fails without a request when github-environment is unset',
      () => {
        // GitHub doesn't enforce `required: true` on action inputs.
        stubInputEnv(INPUT_KEY_GITHUB_ENVIRONMENT, '')

        return Effect.gen(function* () {
          expect.assertions(1)

          const failure = yield* Effect.flip(checkEnvironment)

          expect(failure.message).toBe(
            'GitHub Environment: Input required and not supplied: github-environment'
          )
        }).pipe(Effect.provide(CommonLayer))
      }
    )

    it.effect('success', () =>
      Effect.gen(function* () {
        expect.assertions(1)

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

        expect(environment).toMatchInlineSnapshot(`
          {
            "id": "EN_kwDOJn0nrM5D_l8n",
            "name": "unlike-dev (Preview)",
            "refId": "MDg6Q2hlY2tSdW4xMjM0NTY3ODk=",
          }
        `)
      }).pipe(Effect.provide(CommonLayer))
    )

    // What GitHub returns when the token lacks a permission — README.md's
    // Troubleshooting table quotes the message.
    const FORBIDDEN_ERRORS: GitHubGraphQLError[] = [
      {
        type: 'FORBIDDEN',
        path: ['repository', 'environment'],
        message: 'Resource not accessible by integration'
      }
    ]

    const RESPONSES: Array<{
      title: string
      response: Parameters<typeof mockQueryGetEnvironment>
      expected: string
    }> = [
      {
        title: 'GraphQL errors',
        response: [
          {
            repository: {
              environment: null,
              ref: {
                id: 'MDg6Q2hlY2tSdW4xMjM0NTY3ODk='
              }
            }
          },
          FORBIDDEN_ERRORS
        ],
        expected: `GitHub Environment: Errors - ${JSON.stringify(FORBIDDEN_ERRORS)}`
      },
      {
        // What GitHub returns: `environment: null` and a NOT_FOUND error.
        title: 'a missing environment',
        response: [
          {
            repository: {
              environment: null,
              ref: {
                id: 'MDg6Q2hlY2tSdW4xMjM0NTY3ODk='
              }
            }
          },
          [
            {
              type: 'NOT_FOUND',
              path: ['repository', 'environment'],
              message:
                'Could not resolve to an Environment with the name mock-github-environment.'
            }
          ]
        ],
        expected: `GitHub Environment: Not created for mock-github-environment`
      },
      {
        title: 'a missing ref',
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
      'fails on $title without calling setFailed',
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
