import {describe, expect, test} from 'vitest'

import type {PagesDeployment} from '@/common/cloudflare/types.js'

import {getCloudflareDeploymentAlias} from '@/common/cloudflare/deployment/get.js'

describe(getCloudflareDeploymentAlias, () => {
  test('returns deployment url when aliases is null', () => {
    expect.assertions(1)

    const alias = getCloudflareDeploymentAlias({
      aliases: null,
      url: 'https://helloworld.pages.dev'
    } as PagesDeployment)

    expect(alias).toBe('https://helloworld.pages.dev')
  })

  test('returns deployment url when aliases is empty array', () => {
    expect.assertions(1)

    const alias = getCloudflareDeploymentAlias({
      aliases: [],
      url: 'https://helloworld.pages.dev'
    } as unknown as PagesDeployment)

    expect(alias).toBe('https://helloworld.pages.dev')
  })

  test('returns deployment first alias when aliases is not empty array', () => {
    expect.assertions(1)

    const alias = getCloudflareDeploymentAlias({
      aliases: ['https://helloworld-alias.pages.dev'],
      url: 'https://helloworld.pages.dev'
    } as PagesDeployment)

    expect(alias).toBe('https://helloworld-alias.pages.dev')
  })
})
