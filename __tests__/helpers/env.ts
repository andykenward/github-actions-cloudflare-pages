import type {WebhookEventName} from '@octokit/webhooks-types'

import {vi} from 'vitest'

const getPayload = (eventName: WebhookEventName): string => {
  switch (eventName) {
    case 'pull_request': {
      return '__generated__/payloads/api.github.com/pull_request/opened.payload.json'
    }
    case 'workflow_dispatch': {
      return '__generated__/payloads/api.github.com/workflow_dispatch/payload.json'
    }
    default: {
      throw new Error('No payload to test for')
    }
  }
}

export const TEST_ENV_VARS = (
  eventName: WebhookEventName = 'pull_request'
): NodeJS.ProcessEnv => ({
  GITHUB_HEAD_REF: 'mock-github-head-ref',
  GITHUB_REF: 'refs/heads/mock-github-ref',
  GITHUB_REF_NAME: 'mock-github-ref-name',
  GITHUB_SHA: 'mock-github-sha',
  GITHUB_EVENT_NAME: eventName,
  GITHUB_REPOSITORY: 'andykenward/github-actions-cloudflare-pages',
  GITHUB_REPOSITORY_ID: 'R_kgDOJn0nrA',
  GITHUB_EVENT_PATH: getPayload(eventName),
  GITHUB_GRAPHQL_URL: 'https://api.github.com/graphql'
})

export const stubTestEnvVars = (
  eventName: WebhookEventName = 'pull_request'
) => {
  const VARS = TEST_ENV_VARS(eventName)
  for (const key in VARS) {
    const value = VARS[key]
    if (!value) {
      throw new Error(`Missing TEST_ENV_VARS value for key: ${key}`)
    }
    vi.stubEnv(key, value)
  }
}
