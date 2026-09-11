import {it} from '@effect/vitest'
import * as Effect from 'effect/Effect'
import {afterEach, beforeEach, describe, expect, vi} from 'vitest'

import type {MockApi} from '@/tests/helpers/api.js'

import {GitHubApi} from '@/common/github/api/client.js'
import {CommonLayer} from '@/common/layer.js'
import {getMockApi} from '@/tests/helpers/api.js'

vi.mock(import('@actions/core'))

const QUERY = 'query { viewer { login } }'

const ERRORS = [{type: 'NOT_FOUND', message: 'Not found'}]

describe(GitHubApi, () => {
  let mockApi: MockApi

  beforeEach(() => {
    mockApi = getMockApi()
  })

  afterEach(async () => {
    mockApi.mockAgent.assertNoPendingInterceptors()
    await mockApi.mockAgent.close()
  })

  it.effect('fails with the status on a non-2xx response', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      // GitHub returns JSON for a 401, so this once parsed cleanly, carried no
      // `errors` field, and silently produced `data: undefined`.
      mockApi.interceptGithub({query: QUERY}, {data: {}}, 401)

      const github = yield* GitHubApi
      const error = yield* Effect.flip(github.request({query: QUERY}))

      expect(error.message).toContain('GitHub API request failed: 401')
    }).pipe(Effect.provide(CommonLayer))
  )

  it.effect('fails on GraphQL errors by default', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      mockApi.interceptGithub({query: QUERY}, {data: {}, errors: ERRORS})

      const github = yield* GitHubApi
      const error = yield* Effect.flip(github.request({query: QUERY}))

      expect(error.message).toBe(JSON.stringify(ERRORS))
    }).pipe(Effect.provide(CommonLayer))
  )

  it.effect('fails on GraphQL errors when options omit errorThrows', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      // `options || {errorThrows: true}` let `options: {}` disable throwing.
      mockApi.interceptGithub({query: QUERY}, {data: {}, errors: ERRORS})

      const github = yield* GitHubApi
      const error = yield* Effect.flip(
        github.request({query: QUERY, options: {}})
      )

      expect(error.message).toBe(JSON.stringify(ERRORS))
    }).pipe(Effect.provide(CommonLayer))
  )

  it.effect('returns GraphQL errors when errorThrows is false', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      mockApi.interceptGithub({query: QUERY}, {data: {}, errors: ERRORS})

      const github = yield* GitHubApi
      const response = yield* github.request({
        query: QUERY,
        options: {errorThrows: false}
      })

      expect(response.errors).toStrictEqual(ERRORS)
    }).pipe(Effect.provide(CommonLayer))
  )
})
