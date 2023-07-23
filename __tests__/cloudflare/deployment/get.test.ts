import {describe, expect, test} from 'vitest'

import type {PagesDeployment} from '@/src/cloudflare/types.js'
import {getCloudflareDeploymentAlias} from '@/src/cloudflare/deployment/get.js'

describe('getCloudflareDeploymentAlias', () => {
  test('returns deployment url when aliases is null', () => {
    const alias = getCloudflareDeploymentAlias({
      aliases: null,
      url: 'https://helloworld.pages.dev'
    } as PagesDeployment)

    expect(alias).toStrictEqual('https://helloworld.pages.dev')
  })

  test('returns deployment url when aliases is empty array', () => {
    const alias = getCloudflareDeploymentAlias({
      aliases: [],
      url: 'https://helloworld.pages.dev'
    } as unknown as PagesDeployment)

    expect(alias).toStrictEqual('https://helloworld.pages.dev')
  })

  test('returns deployment first alias when aliases is not empty array', () => {
    const alias = getCloudflareDeploymentAlias({
      aliases: ['https://helloworld-alias.pages.dev'],
      url: 'https://helloworld.pages.dev'
    } as PagesDeployment)

    expect(alias).toStrictEqual('https://helloworld-alias.pages.dev')
  })
})
