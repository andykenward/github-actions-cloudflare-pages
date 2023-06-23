export const TEST_ENV_VARS: NodeJS.ProcessEnv = {
  GITHUB_HEAD_REF: 'mock-github-head-ref',
  GITHUB_REF_NAME: 'mock-github-ref-name',
  GITHUB_SHA: 'mock-github-sha',
  GITHUB_EVENT_NAME: 'pull_request',
  GITHUB_REPOSITORY: 'mock-owner/mock-github-repository',
  GITHUB_EVENT_PATH:
    '__generated__/payloads/api.github.com/pull_request/opened.payload.json'
}

export const setTestEnvVars = () => {
  for (const key in TEST_ENV_VARS) {
    if (Object.prototype.hasOwnProperty.call(TEST_ENV_VARS, key)) {
      process.env[key] = TEST_ENV_VARS[key]
    }
  }
}
