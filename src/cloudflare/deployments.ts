import type {Deployment} from '@cloudflare/types'

import {getInput} from '@unlike/github-actions-core'
import {$} from 'execa'

import {
  ACTION_INPUT_ACCOUNT_ID,
  ACTION_INPUT_API_TOKEN,
  ACTION_INPUT_DIRECTORY,
  ACTION_INPUT_PROJECT_NAME,
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_API_TOKEN
} from '../constants.js'
import {getCloudflareApiEndpoint} from './api/endpoints.js'
import {fetchResult} from './api/fetch-result.js'

const getDeployments = async (): Promise<Array<Deployment>> => {
  const url = getCloudflareApiEndpoint('deployments')

  const result = await fetchResult<Array<Deployment>>(url)

  return result
}

const ERROR_KEY = `Create Deployment:`

export const createDeployment = async () => {
  const accountId = getInput(ACTION_INPUT_ACCOUNT_ID, {
    required: true
  })
  const projectName = getInput(ACTION_INPUT_PROJECT_NAME, {
    required: true
  })
  const directory = getInput(ACTION_INPUT_DIRECTORY, {
    required: true
  })
  const apiToken = getInput(ACTION_INPUT_API_TOKEN, {
    required: true
  })

  /**
   * Depending on what event triggers the action.
   * The GITHUB_HEAD_REF may be undefined so we fallback to GITHUB_REF_NAME.
   * It checks `branch` against the `project.production_branch` if `branch`
   * is not undefined.
   * https://github.com/cloudflare/workers-sdk/blob/a728876e607635081cd1ed00d06b7af86e7efd49/packages/wrangler/src/api/pages/deploy.tsx#L133-L136
   */
  const branch: string =
    process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME
  const commitHash = process.env.GITHUB_SHA

  process.env[CLOUDFLARE_API_TOKEN] = apiToken
  process.env[CLOUDFLARE_ACCOUNT_ID] = accountId

  if (branch === undefined) {
    throw new Error(`${ERROR_KEY} branch is undefined`)
  }

  if (commitHash === undefined) {
    throw new Error(`${ERROR_KEY} commitHash is undefined`)
  }

  try {
    /**
     * Tried to use wrangler.unstable_pages.deploy. But wrangler is 8mb+ and the bundler is unable to tree shake it.
     */
    await $`npx wrangler pages deploy ${directory} --project-name=${projectName} --branch=${branch} --commit-dirty=true --commit-hash=${commitHash}`

    // get deployment
    const [deployment] = await getDeployments()

    return deployment
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    if (
      error &&
      typeof error === 'object' &&
      'stderr' in error &&
      typeof error.stderr === 'string'
    ) {
      throw new Error(error.stderr)
    }
    throw new Error(`${ERROR_KEY} unknown error`)
  }
}
