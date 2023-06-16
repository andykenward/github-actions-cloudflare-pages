import type {Deployment} from '@cloudflare/types'

import {getInput} from '@unlike/github-actions-core'
import wrangler from 'wrangler'

import {
  ACTION_INPUT_ACCOUNT_ID,
  ACTION_INPUT_API_TOKEN,
  ACTION_INPUT_DIRECTORY,
  ACTION_INPUT_PROJECT_NAME,
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_API_TOKEN
} from '../../constants.js'

export const createDeployment = async () => {
  const accountId = getInput(ACTION_INPUT_ACCOUNT_ID, {
    required: true
  })
  const projectName = getInput(ACTION_INPUT_PROJECT_NAME, {required: true})
  const directory = getInput(ACTION_INPUT_DIRECTORY, {required: true})
  const apiToken = getInput(ACTION_INPUT_API_TOKEN, {
    required: true
  })

  /**
   * Depending on what event triggers the action.
   * The GITHUB_HEAD_REF may be undefined so we fallback to GITHUB_REF_NAME.
   * `wrangler.unstable_pages.deploy` default to production environment.
   * It checks `branch` against the `project.production_branch` if `branch`
   * is not undefined.
   * https://github.com/cloudflare/workers-sdk/blob/a728876e607635081cd1ed00d06b7af86e7efd49/packages/wrangler/src/api/pages/deploy.tsx#L133-L136
   */
  const branch: string =
    process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME
  const commitHash = process.env.GITHUB_SHA

  process.env[CLOUDFLARE_API_TOKEN] = apiToken
  process.env[CLOUDFLARE_ACCOUNT_ID] = accountId

  const deployment: Deployment = await wrangler.unstable_pages.deploy({
    accountId,
    branch,
    commitHash,
    directory,
    projectName
    // commitDirty: true
  })

  return deployment
}
