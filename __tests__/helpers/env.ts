export const TEST_ENV_VARS: NodeJS.ProcessEnv = {
  GITHUB_HEAD_REF: 'mock-github-head-ref',
  GITHUB_REF: 'mock-github-ref',
  GITHUB_REF_NAME: 'mock-github-ref-name',
  GITHUB_SHA: 'mock-github-sha',
  GITHUB_EVENT_NAME: 'pull_request',
  GITHUB_REPOSITORY: 'unlike-ltd/github-actions-cloudflare-pages',
  GITHUB_REPOSITORY_ID: 'R_kgDOJn0nrA',
  GITHUB_EVENT_PATH:
    '__generated__/payloads/api.github.com/pull_request/opened.payload.json',
  GITHUB_GRAPHQL_URL: 'https://api.github.com/graphql'
}

export const setTestEnvVars = () => {
  for (const key in TEST_ENV_VARS) {
    if (Object.prototype.hasOwnProperty.call(TEST_ENV_VARS, key)) {
      process.env[key] = TEST_ENV_VARS[key]
    }
  }
}
