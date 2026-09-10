import {strict} from 'node:assert'

import {setOutput, summary} from '@actions/core'
import * as Predicate from 'effect/Predicate'

import {useContext} from '@/common/github/context.js'
import {secret, useCommonInputs} from '@/common/inputs.js'
import {execFileAsync, logVerbatim} from '@/common/utils.js'

import type {PagesDeployment} from '../types.js'
import type {StatusOptions} from './status.js'

import {getCloudflareDeploymentAlias} from './get.js'
import {statusCloudflareDeployment} from './status.js'

export const CLOUDFLARE_API_TOKEN = 'CLOUDFLARE_API_TOKEN'
export const CLOUDFLARE_ACCOUNT_ID = 'CLOUDFLARE_ACCOUNT_ID'
const ERROR_KEY = `Create Deployment:`

export const createCloudflareDeployment = async ({
  accountId,
  projectName,
  directory,
  workingDirectory = '',
  branch: branchOverride,
  statusOptions
}: {
  accountId: string
  projectName: string
  directory: string
  workingDirectory?: string
  branch?: string
  /**
   * Poll tuning, forwarded to `statusCloudflareDeployment`. Tests use it to
   * poll without delay.
   */
  statusOptions?: StatusOptions
}): Promise<{
  deployment: PagesDeployment
  wranglerOutput: string
}> => {
  const {cloudflareApiToken, wranglerVersion} = useCommonInputs()

  /**
   * Scoped to the wrangler child process rather than assigned onto the global
   * `process.env`, which left the Cloudflare API token in plaintext in this
   * process for everything downstream to read.
   */
  const wranglerEnv = {
    ...process.env,
    [CLOUDFLARE_API_TOKEN]: secret(cloudflareApiToken),
    [CLOUDFLARE_ACCOUNT_ID]: accountId
  }

  const {repo, branch: contextBranch, sha: commitHash} = useContext()

  const branch = branchOverride ?? contextBranch

  if (branch === undefined) {
    throw new Error(`${ERROR_KEY} branch is undefined`)
  }

  try {
    const WRANGLER_VERSION = wranglerVersion
    strict.ok(WRANGLER_VERSION, 'wrangler version should exist')
    /**
     * Tried to use wrangler.unstable_pages.deploy. But wrangler is 8mb+ and the bundler is unable to tree shake it.
     */
    const {stdout} = await execFileAsync(
      'npx',
      [
        `wrangler@${WRANGLER_VERSION}`,
        'pages',
        'deploy',
        directory,
        '--project-name',
        projectName,
        '--branch',
        branch,
        '--commit-dirty=true',
        '--commit-hash',
        commitHash
      ],
      {
        env: wranglerEnv,
        cwd: workingDirectory
      }
    )
    /**
     * Log out wrangler output.
     */
    logVerbatim(stdout)
    /**
     * Get the latest deployment by commitHash and poll until required status.
     */
    const {deployment, status} = await statusCloudflareDeployment(
      {accountId, projectName},
      statusOptions
    )

    setOutput('id', deployment.id)
    setOutput('url', deployment.url)
    setOutput('environment', deployment.environment)

    const alias: string = getCloudflareDeploymentAlias(deployment)
    setOutput('alias', alias)
    setOutput('wrangler', stdout)

    await summary
      .addHeading('Cloudflare Pages Deployment')
      .addBreak()
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
        ['Status:', `<strong>${status.toUpperCase() || `UNKNOWN`}</strong>`],
        ['Preview URL:', `<a href='${deployment.url}'>${deployment.url}</a>`],
        ['Branch Preview URL:', `<a href='${alias}'>${alias}</a>`],
        ['Wrangler Output:', `${stdout}`]
      ])
      .write()

    return {deployment, wranglerOutput: stdout}
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    if (
      Predicate.hasProperty(error, 'stderr') &&
      Predicate.isString(error.stderr)
    ) {
      throw new Error(error.stderr, {cause: error})
    }
    throw new Error(`${ERROR_KEY} unknown error`, {cause: error})
  }
}
