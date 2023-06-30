import * as core from '@unlike/github-actions-core'
import {beforeEach, describe, expect, test, vi} from 'vitest'

import type {
  CreateEnvironmentMutation,
  CreateEnvironmentMutationVariables
} from '@/gql/graphql.js'
import type {GraphqlResponse} from '@/src/github/api/client.js'
import {
  createEnvironment,
  MutationCreateEnvironment
} from '@/src/github/environment.js'

import {
  getMockApi,
  setRequiredInputEnv,
  TEST_ENV_VARS
} from '../helpers/index.js'

vi.mock('@unlike/github-actions-core')

describe('environment', () => {
  let mockApi: ReturnType<typeof getMockApi>
  const spyError = vi.spyOn(core, 'error')
  const spyNotice = vi.spyOn(core, 'notice')
  beforeEach(() => {
    mockApi = getMockApi()
    setRequiredInputEnv()
  })

  describe('createEnvironment', () => {
    test('success', async () => {
      mockApi.mockPoolGitHub
        .intercept({
          path: '/graphql',
          method: 'POST',
          body: JSON.stringify({
            query: MutationCreateEnvironment.toString(),
            variables: {
              repositoryId: `MDEwOlJlcG9zaXRvcnkxODY4NTMwMDI=`,
              name: TEST_ENV_VARS.GITHUB_HEAD_REF as string
            } satisfies CreateEnvironmentMutationVariables
          })
        })
        .reply(200, {
          data: {
            createEnvironment: {
              environment: {
                name: 'unlike-dev (Preview)',
                id: 'EN_kwDOJn0nrM5D_l8n'
              }
            }
          }
        } satisfies GraphqlResponse<CreateEnvironmentMutation>)

      const environment = await createEnvironment()

      expect(spyError).not.toHaveBeenCalled()
      expect(spyNotice).not.toHaveBeenCalled()
      expect(environment).toMatchInlineSnapshot(`
        {
          "id": "EN_kwDOJn0nrM5D_l8n",
          "name": "unlike-dev (Preview)",
        }
      `)
    })

    test('logs errors & missing environment', async () => {
      mockApi.mockPoolGitHub
        .intercept({
          path: '/graphql',
          method: 'POST',
          body: JSON.stringify({
            query: MutationCreateEnvironment.toString(),
            variables: {
              repositoryId: `MDEwOlJlcG9zaXRvcnkxODY4NTMwMDI=`,
              name: TEST_ENV_VARS.GITHUB_HEAD_REF
            }
          })
        })
        .reply(200, {
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
        } satisfies GraphqlResponse<CreateEnvironmentMutation>)

      const environment = await createEnvironment()

      expect(spyError).toHaveBeenCalledWith(
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
      expect(spyNotice).toHaveBeenCalledWith('GitHub Environment: Not created')
      expect(environment).toBeNull()
    })
  })
})
