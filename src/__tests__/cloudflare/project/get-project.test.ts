import type {Project} from '@cloudflare/types'
import {afterEach, describe, expect, expectTypeOf, test, vi} from 'vitest'

import {fetchResult} from '@/cloudflare/api/fetch-result'
import {PROJECT_RESPONSE_OK} from '@/cloudflare/project/__mocks__/responses/200'
import {getProject} from '@/cloudflare/project/get-project'

vi.mock('@/cloudflare/api/endpoints')
vi.mock('@/cloudflare/api/fetch-result')

describe('getProject', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('returns project response', async () => {
    vi.mocked(fetchResult).mockResolvedValueOnce(PROJECT_RESPONSE_OK)

    expectTypeOf(getProject).returns.resolves.toMatchTypeOf<Project>()

    await expect(getProject()).resolves.toStrictEqual(PROJECT_RESPONSE_OK)
  })
})
