import {error, notice} from '@unlike/github-actions-core'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

import {
  checkEnvironment,
  createEnvironment,
  MutationCreateEnvironment,
  QueryGetEnvironment
} from '@/src/github/environment.js'

import type {MockApi} from '../helpers/index.js'
import {
  getMockApi,
  setRequiredInputEnv,
  TEST_ENV_VARS
} from '../helpers/index.js'

vi.mock('@unlike/github-actions-core')
describe('environment', () => {
  let mockApi: MockApi

  beforeEach(() => {
    mockApi = getMockApi()
    setRequiredInputEnv()
  })

  afterEach(async () => {
    await mockApi.mockAgent.close()
  })

  describe('createEnvironment', () => {
    test('success', async () => {
      mockApi.interceptGithub(
        {
          query: MutationCreateEnvironment,
          variables: {
            repositoryId: `MDEwOlJlcG9zaXRvcnkxODY4NTMwMDI=`,
            name: TEST_ENV_VARS.GITHUB_HEAD_REF as string
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
      mockApi.interceptGithub(
        {
          query: MutationCreateEnvironment,
          variables: {
            repositoryId: `MDEwOlJlcG9zaXRvcnkxODY4NTMwMDI=`,
            name: TEST_ENV_VARS.GITHUB_HEAD_REF as string
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
    test('success', async () => {
      mockApi.interceptGithub(
        {
          query: QueryGetEnvironment,
          variables: {
            owner: 'unlike-ltd',
            repo: 'github-actions-cloudflare-pages',
            environment_name: 'mock-github-environment'
          }
        },
        {
          data: {
            repository: {
              environment: {
                name: 'unlike-dev (Preview)',
                id: 'EN_kwDOJn0nrM5D_l8n'
              }
            }
          }
        }
      )

      const environment = await checkEnvironment()

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
      mockApi.interceptGithub(
        {
          query: QueryGetEnvironment,
          variables: {
            owner: 'unlike-ltd',
            repo: 'github-actions-cloudflare-pages',
            environment_name: 'mock-github-environment'
          }
        },
        {
          data: {
            repository: {
              environment: null
            }
          },
          errors: [
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
        }
      )

      const environment = await checkEnvironment()

      expect(error).toHaveBeenCalledWith(
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
      )
      expect(notice).toHaveBeenCalledWith(
        'GitHub Environment: Not created for mock-github-environment'
      )
      expect(environment).toBeNull()
    })
  })
})
