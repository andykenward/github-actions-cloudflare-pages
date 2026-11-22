import {describe, expect, test} from 'vitest'

import {
  cloudflareIdFromStatus,
  cloudflareStatusFields,
  deploymentStatusInput
} from '@/common/github/deployment/deployment-status.js'
import {DeploymentStatusState} from '@/gql/graphql.js'

const ENDPOINT = {accountId: 'account', projectName: 'project'}

describe(cloudflareStatusFields, () => {
  test('records the URL, the dashboard log and the id', () => {
    expect.assertions(1)

    expect(
      cloudflareStatusFields({...ENDPOINT, id: 'cf-id', url: 'https://x.dev'})
    ).toStrictEqual({
      environmentUrl: 'https://x.dev',
      logUrl: 'https://dash.cloudflare.com/account/pages/view/project/cf-id',
      description: 'Cloudflare Pages Deployment: cf-id'
    })
  })
})

describe(cloudflareIdFromStatus, () => {
  test.each([
    {
      name: 'the description first',
      status: {
        description: 'Cloudflare Pages Deployment: from-description',
        logUrl:
          'https://dash.cloudflare.com/account/pages/view/project/from-log'
      },
      expected: 'from-description'
    },
    {
      name: 'the log URL without a description',
      status: {
        description: null,
        logUrl:
          'https://dash.cloudflare.com/account/pages/view/project/from-log'
      },
      expected: 'from-log'
    },
    {
      name: 'nothing from an Actions log',
      status: {description: 'other', logUrl: 'https://github.com/o/r/actions'},
      expected: undefined
    },
    {
      name: 'nothing from an empty status',
      status: {description: null, logUrl: null},
      expected: undefined
    }
  ])('reads $name', ({status, expected}) => {
    expect.assertions(1)

    expect(cloudflareIdFromStatus(status, ENDPOINT)).toBe(expected)
  })
})

describe(deploymentStatusInput, () => {
  test('leaves out the fields it was not given', () => {
    expect.assertions(1)

    expect(
      JSON.stringify(
        deploymentStatusInput({
          deploymentId: 'DE_1',
          environment: 'preview',
          state: DeploymentStatusState.Error
        })
      )
    ).toBe(
      '{"deploymentId":"DE_1","environment":"preview","state":"ERROR","autoInactive":false}'
    )
  })
})
