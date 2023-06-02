import {describe, expect, test, vi} from 'vitest'

import {getProject} from '../../../cloudflare/project/get-project.js'

vi.mock('../../../cloudflare/api/endpoints')
vi.mock('../../../cloudflare/api/fetch-result')

describe('getProject', () => {
  test('returns project response', async () => {
    expect.assertions(1)

    await expect(getProject()).resolves.toMatchInlineSnapshot(`
      {
        "id": "mock-id",
      }
    `)
  })
})
