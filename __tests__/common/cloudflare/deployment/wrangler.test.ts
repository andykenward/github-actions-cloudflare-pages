import {describe, expect, test} from 'vitest'

import {deploymentIdFrom} from '@/common/cloudflare/deployment/wrangler.js'

const line = (entry: object): string => `${JSON.stringify(entry)}\n`

describe(deploymentIdFrom, () => {
  test('returns the id from the pages-deploy-detailed entry', () => {
    expect.assertions(1)

    const output =
      line({type: 'wrangler-session', version: 1}) +
      line({
        type: 'pages-deploy-detailed',
        version: 1,
        pages_project: 'project',
        deployment_id: 'deployment-id',
        url: 'https://example.pages.dev'
      })

    expect(deploymentIdFrom(output)).toBe('deployment-id')
  })

  test('returns undefined when wrangler wrote no such entry', () => {
    expect.assertions(2)

    expect(deploymentIdFrom('')).toBeUndefined()
    expect(
      deploymentIdFrom(line({type: 'wrangler-session', version: 1}))
    ).toBeUndefined()
  })

  test('skips lines that are not JSON', () => {
    expect.assertions(1)

    const output =
      '{not json\n' +
      line({type: 'pages-deploy-detailed', deployment_id: 'deployment-id'})

    expect(deploymentIdFrom(output)).toBe('deployment-id')
  })
})
