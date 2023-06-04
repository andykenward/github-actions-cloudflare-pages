import {setOutput} from '@actions/core'
import {describe, expect, test, vi} from 'vitest'

import {getProject} from '../cloudflare/project/get-project.js'
import {run} from '../main.js'

vi.mock('@actions/core')
vi.mock('wrangler')
vi.mock('../cloudflare/project/get-project')
vi.mock('../github/context')

describe.skip('main', () => {
  test('can mock project response', async () => {
    expect.assertions(2)
    await expect(run()).resolves.not.toThrow()
    expect(setOutput).toHaveBeenCalledTimes(2)
  })

  test('can error mock', async () => {
    expect.assertions(1)
    vi.mocked(getProject).mockRejectedValueOnce({message: 'mock error'})

    await expect(() => run()).rejects.toThrowErrorMatchingInlineSnapshot(`
      {
        "message": "mock error",
      }
    `)
  })
})
