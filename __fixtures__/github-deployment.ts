import type {GitHubDeployment} from '@/common/github/deployment/get.js'

import {
  MOCK_ACCOUNT_ID,
  MOCK_DEPLOYMENT_ID,
  MOCK_PROJECT_NAME
} from '@/tests/helpers/api.js'

/** A listed deployment, as `getGitHubDeployments` decodes one. */
export const DEPLOYMENT: GitHubDeployment = {
  node_id: 'DE_kwDOJn0nrM5U35aT',
  environment: 'preview',
  payload: {
    cloudflare: {
      id: MOCK_DEPLOYMENT_ID,
      projectName: MOCK_PROJECT_NAME,
      accountId: MOCK_ACCOUNT_ID
    },
    url: 'https://4834e1f5.cloudflare-pages-action-a5z.pages.dev',
    commentId: 'IC_kwDOJn0nrM55B77z'
  }
}
