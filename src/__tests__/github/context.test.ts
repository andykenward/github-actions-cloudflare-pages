import {describe, expect, test} from 'vitest'

import {getGitHubContext} from '../../github/context.js'

describe('getGitHubContext', () => {
  test('returns eventName ', () => {
    process.env.GITHUB_EVENT_NAME = 'pull_request'

    expect(getGitHubContext()).toStrictEqual({
      eventName: 'pull_request',
      payload: undefined
    })
  })
})
