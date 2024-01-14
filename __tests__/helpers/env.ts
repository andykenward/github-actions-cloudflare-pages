import {vi} from 'vitest'

export const TEST_ENV_VARS: NodeJS.ProcessEnv = {
  GITHUB_HEAD_REF: 'mock-github-head-ref',
  GITHUB_REF: 'refs/heads/mock-github-ref',
  GITHUB_REF_NAME: 'mock-github-ref-name',
  GITHUB_SHA: 'mock-github-sha',
  GITHUB_EVENT_NAME: 'pull_request',
  GITHUB_REPOSITORY: 'unlike-ltd/github-actions-cloudflare-pages',
  GITHUB_REPOSITORY_ID: 'R_kgDOJn0nrA',
  GITHUB_EVENT_PATH:
    '__generated__/payloads/api.github.com/pull_request/opened.payload.json',
  GITHUB_GRAPHQL_URL: 'https://api.github.com/graphql'
}

export const stubTestEnvVars = () => {
  for (const key in TEST_ENV_VARS) {
    const value = TEST_ENV_VARS[key]
    if (!value) {
      throw new Error(`Missing TEST_ENV_VARS value for key: ${key}`)
    }
    vi.stubEnv(key, value)
  }
}
