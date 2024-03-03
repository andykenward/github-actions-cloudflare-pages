import {error, notice, setFailed} from '@unlike/github-actions-core'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

import type {GetEnvironmentQuery} from '@/gql/graphql.js'
import type {GitHubGraphQLError} from '@/src/github/api/client.js'
import type {MockApi} from '@/tests/helpers/api.js'

import {
  checkEnvironment,
  createEnvironment,
  MutationCreateEnvironment,
  QueryGetEnvironment
} from '@/src/github/environment.js'
import {getMockApi} from '@/tests/helpers/api.js'
import {TEST_ENV_VARS} from '@/tests/helpers/env.js'

vi.mock('@unlike/github-actions-core')
describe('environment', () => {
  let mockApi: MockApi

  const mockQueryGetEnvironment = (
    data: GetEnvironmentQuery,
    errors?: GitHubGraphQLError[] | undefined
  ): void => {
    mockApi.interceptGithub(
      {
        query: QueryGetEnvironment,
        variables: {
          owner: 'unlike-ltd',
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

  describe('createEnvironment', () => {
    test('success', async () => {
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

      const environment = await createEnvironment()

      expect(error).not.toHaveBeenCalled()
      expect(notice).not.toHaveBeenCalled()
      expect(environment).toMatchInlineSnapshot(`
        {
          "id": "EN_kwDOJn0nrM5D_l8n",
          "name": "unlike-dev (Preview)",
        }
      `)
    })

    test('logs errors & missing environment', async () => {
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

      const environment = await createEnvironment()

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
    })
  })

  describe('checkEnvironment', () => {
    const spySetFailed = vi.mocked(setFailed)

    test('success', async () => {
      expect.assertions(4)

      mockQueryGetEnvironment({
        repository: {
          environment: {
            name: 'unlike-dev (Preview)',
            id: 'EN_kwDOJn0nrM5D_l8n'
          },
          ref: {
            id: 'MDg6Q2hlY2tSdW4xMjM0NTY3ODk=',
            name: 'mock-github-head-ref',
            prefix: 'refs/heads/'
          }
        }
      })

      const environment = await checkEnvironment()

      expect(error).not.toHaveBeenCalled()
      expect(spySetFailed).not.toHaveBeenCalled()
      expect(notice).not.toHaveBeenCalled()
      expect(environment).toMatchInlineSnapshot(`
        {
          "id": "EN_kwDOJn0nrM5D_l8n",
          "name": "unlike-dev (Preview)",
          "refId": "MDg6Q2hlY2tSdW4xMjM0NTY3ODk=",
        }
      `)
    })

    const RESPONSES: Array<
      [Parameters<typeof mockQueryGetEnvironment>, string]
    > = [
      [
        [
          {
            repository: {
              environment: null
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
        `GitHub Environment: Errors - ${JSON.stringify([
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
      ],
      [
        [
          {
            repository: {
              environment: undefined,
              ref: {
                id: 'MDg6Q2hlY2tSdW4xMjM0NTY3ODk=',
                name: 'mock-github-head-ref',
                prefix: 'refs/heads/'
              }
            }
          }
        ],
        `GitHub Environment: Not created for mock-github-environment`
      ],
      [
        [
          {
            repository: {
              environment: {
                name: 'unlike-dev (Preview)',
                id: 'EN_kwDOJn0nrM5D_l8n'
              },
              ref: undefined
            }
          }
        ],
        `GitHub Environment: No ref id mock-github-environment`
      ]
    ]

    test.each(RESPONSES)(`setFailed is called`, async (response, expected) => {
      expect.assertions(2)
      mockQueryGetEnvironment(...response)
      await expect(checkEnvironment()).rejects.toThrow(expected)
      expect(spySetFailed).toHaveBeenCalledWith(expected)
    })
  })
})
