import {
  error,
  info,
  setOutput,
  summary,
  warning
} from '@unlike/github-actions-core'
import {$} from 'execa'

import type {PagesDeployment} from './types.js'
import {useContext} from '../github/context.js'
import {useInputs} from '../inputs.js'
import {getCloudflareApiEndpoint} from './api/endpoints.js'
import {fetchResult, fetchSuccess} from './api/fetch-result.js'
import {ParseError} from './api/parse-error.js'

/** Environment variables key for Cloudflare wrangler */
export const CLOUDFLARE_API_TOKEN = 'CLOUDFLARE_API_TOKEN'
/** Environment variables key for Cloudflare wrangler */
export const CLOUDFLARE_ACCOUNT_ID = 'CLOUDFLARE_ACCOUNT_ID'
const ERROR_KEY = `Create Deployment:`

const getDeployments = async (): Promise<Array<PagesDeployment>> => {
  const url = getCloudflareApiEndpoint('deployments')

  const result = await fetchResult<Array<PagesDeployment>>(url)

  return result
}

export const deleteDeployment = async (
  deploymentIdentifier: string
): Promise<boolean> => {
  const url = getCloudflareApiEndpoint(
    `deployments/${deploymentIdentifier}?force=true`
  )

  try {
    const success = await fetchSuccess(url, {
      method: 'DELETE'
    })

    if (success === true) {
      info(`Cloudflare Deployment Deleted: ${deploymentIdentifier}`)
      return true
    }
    throw new Error('Cloudflare Delete Deployment: fail')
  } catch (successError) {
    if (successError instanceof ParseError && successError.code === 8_000_009) {
      /**
       * The cloudflare deployment might have been deleted manually. So return true.
       * Error response example
       * {
       *   "code": 8000009,
       *   "message": "The deployment ID you have specified does not exist. Update the deployment ID and try again. "
       * }
       */
      warning(
        `Cloudflare Deployment might have been deleted already: ${deploymentIdentifier}`
      )
      return true
    }
    error(`Cloudflare Error deleting deployment: ${deploymentIdentifier}`)
    return false
  }
}

export const getDeploymentAlias = (deployment: PagesDeployment): string => {
  return deployment.aliases && deployment.aliases.length > 0
    ? deployment.aliases[0]
    : deployment.url
}

export const createDeployment = async () => {
  const {
    cloudflareAccountId,
    cloudflareProjectName,
    directory,
    cloudflareApiToken
  } = useInputs()

  process.env[CLOUDFLARE_API_TOKEN] = cloudflareApiToken
  process.env[CLOUDFLARE_ACCOUNT_ID] = cloudflareAccountId

  const {repo, branch, sha: commitHash} = useContext()

  if (branch === undefined) {
    throw new Error(`${ERROR_KEY} branch is undefined`)
  }

  try {
    /**
     * Tried to use wrangler.unstable_pages.deploy. But wrangler is 8mb+ and the bundler is unable to tree shake it.
     */
    await $`npx wrangler@3.2.0 pages deploy ${directory} --project-name=${cloudflareProjectName} --branch=${branch} --commit-dirty=true --commit-hash=${commitHash}`

    /**
     * Get the latest deployment by commitHash.
     */
    const deployments = await getDeployments()
    const deployment = deployments?.find(
      deployment =>
        deployment.deployment_trigger.metadata.commit_hash === commitHash
    )

    if (deployment === undefined) {
      throw new Error(
        `${ERROR_KEY} could not find deployment with commitHash: ${commitHash}`
      )
    }

    setOutput('id', deployment.id)
    setOutput('url', deployment.url)
    setOutput('environment', deployment.environment)

    const alias: string = getDeploymentAlias(deployment)
    setOutput('alias', alias)

    const deployStage = deployment.stages.find(stage => stage.name === 'deploy')

    await summary.addHeading('Cloudflare Pages Deployment').write()
    await summary.addBreak().write()
    await summary
      .addTable([
        [
          {
            data: 'Name',
            header: true
          },
          {
            data: 'Result',
            header: true
          }
        ],
        ['Environment:', deployment.environment],
        [
          'Branch:',
          `<a href='https://github.com/${repo.owner}/${repo.repo}/tree/${deployment.deployment_trigger.metadata.branch}'><code>${deployment.deployment_trigger.metadata.branch}</code></a>`
        ],
        [
          'Commit Hash:',
          `<a href='https://github.com/${repo.owner}/${repo.repo}/commit/${deployment.deployment_trigger.metadata.commit_hash}'><code>${deployment.deployment_trigger.metadata.commit_hash}</code></a>`
        ],
        [
          'Commit Message:',
          deployment.deployment_trigger.metadata.commit_message
        ],
        [
          'Status:',
          `<strong>${deployStage?.status.toUpperCase() || `UNKNOWN`}</strong>`
        ],
        ['Preview URL:', `<a href='${deployment.url}'>${deployment.url}</a>`],
        ['Branch Preview URL:', `<a href='${alias}'>${alias}</a>`]
      ])
      .write()

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
