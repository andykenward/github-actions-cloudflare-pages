import {
  MOCK_ACCOUNT_ID,
  MOCK_DEPLOYMENT_ID,
  MOCK_PROJECT_NAME
} from '@/tests/helpers/api.js'

import type {getGitHubDeployments} from '@/common/github/deployment/get.js'

export const DEPLOYMENT: Awaited<
  ReturnType<typeof getGitHubDeployments>
>[number] = {
  url: 'https://api.github.com/repos/unlike-ltd/github-actions-cloudflare-pages/deployments/1423939219',
  id: 1423939219,
  node_id: 'DE_kwDOJn0nrM5U35aT',
  task: 'deploy',
  original_environment: 'preview',
  environment: 'preview',
  description:
    'Cloudflare Pages Deployment: 4834e1f5-5ed8-417a-9489-13532994a77f',
  created_at: '2024-04-01T21:03:56Z',
  updated_at: '2024-04-01T21:03:56Z',
  statuses_url:
    'https://api.github.com/repos/unlike-ltd/github-actions-cloudflare-pages/deployments/1423939219/statuses',
  repository_url:
    'https://api.github.com/repos/unlike-ltd/github-actions-cloudflare-pages',
  creator: {
    login: 'github-actions[bot]',
    id: 41898282,
    node_id: 'MDM6Qm90NDE4OTgyODI=',
    avatar_url: 'https://avatars.githubusercontent.com/in/15368?v=4',
    gravatar_id: '',
    url: 'https://api.github.com/users/github-actions%5Bbot%5D',
    html_url: 'https://github.com/apps/github-actions',
    followers_url:
      'https://api.github.com/users/github-actions%5Bbot%5D/followers',
    following_url:
      'https://api.github.com/users/github-actions%5Bbot%5D/following{/other_user}',
    gists_url:
      'https://api.github.com/users/github-actions%5Bbot%5D/gists{/gist_id}',
    starred_url:
      'https://api.github.com/users/github-actions%5Bbot%5D/starred{/owner}{/repo}',
    subscriptions_url:
      'https://api.github.com/users/github-actions%5Bbot%5D/subscriptions',
    organizations_url:
      'https://api.github.com/users/github-actions%5Bbot%5D/orgs',
    repos_url: 'https://api.github.com/users/github-actions%5Bbot%5D/repos',
    events_url:
      'https://api.github.com/users/github-actions%5Bbot%5D/events{/privacy}',
    received_events_url:
      'https://api.github.com/users/github-actions%5Bbot%5D/received_events',
    type: 'Bot',
    site_admin: false
  },
  sha: '7e7171aff2b6443234556b17c599f5cc27927d17',
  ref: 'andykenward/issue289',
  payload: {
    cloudflare: {
      id: MOCK_DEPLOYMENT_ID,
      projectName: MOCK_PROJECT_NAME,
      accountId: MOCK_ACCOUNT_ID
    },
    url: 'https://4834e1f5.cloudflare-pages-action-a5z.pages.dev',
    commentId: 'IC_kwDOJn0nrM55B77z'
  },
  transient_environment: false,
  production_environment: false,
  performed_via_github_app: null
}
