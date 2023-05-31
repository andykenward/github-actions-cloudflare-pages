import {setOutput} from '@actions/core'
import type {Project} from '@cloudflare/types'
import {afterEach, describe, expect, test, vi} from 'vitest'

import {getProject} from '@/cloudflare/project/get-project'
import {run} from '@/main'

vi.mock('@actions/core')
vi.mock('@/cloudflare/project/get-project')

describe('main', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('can mock project response', async () => {
    await expect(run()).resolves.toStrictEqual('mock-project-name')
    // eslint-disable-next-line vitest/prefer-called-with
    expect(setOutput).toHaveBeenCalledOnce()
  })

  test('can we replace the mock in the test', async () => {
    vi.mocked(getProject).mockResolvedValueOnce({
      name: 'another-mock'
    } as Project)

    await expect(run()).resolves.toStrictEqual('another-mock')
  })

  test('can mock project response after', async () => {
    await expect(run()).resolves.toStrictEqual('mock-project-name')
  })

  test('can error mock', async () => {
    vi.mocked(getProject).mockRejectedValueOnce({message: 'mock error'})

    await expect(() => run()).rejects.toThrow('mock error')
  })
})
