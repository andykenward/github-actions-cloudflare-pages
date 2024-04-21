import {strict} from 'node:assert'

import {info, setOutput, summary} from '@actions/core'

import {useContext} from '@/common/github/context.js'
import {useCommonInputs} from '@/common/inputs.js'
import {execAsync} from '@/common/utils.js'

import type {PagesDeployment} from '../types.js'

import {getCloudflareDeploymentAlias} from './get.js'
import {statusCloudflareDeployment} from './status.js'

export const CLOUDFLARE_API_TOKEN = 'CLOUDFLARE_API_TOKEN'
export const CLOUDFLARE_ACCOUNT_ID = 'CLOUDFLARE_ACCOUNT_ID'
const ERROR_KEY = `Create Deployment:`

export const createCloudflareDeployment = async ({
  accountId,
  projectName,
  directory,
  workingDirectory = ''
}: {
  accountId: string
  projectName: string
  directory: string
  workingDirectory?: string
}): Promise<{
  deployment: PagesDeployment
  wranglerOutput: string
}> => {
  const {cloudflareApiToken} = useCommonInputs()

  process.env[CLOUDFLARE_API_TOKEN] = cloudflareApiToken
  process.env[CLOUDFLARE_ACCOUNT_ID] = accountId

  const {repo, branch, sha: commitHash} = useContext()

  if (branch === undefined) {
    throw new Error(`${ERROR_KEY} branch is undefined`)
  }

  try {
    /**
     * At build process.env.npm_package_dependencies_wrangler is replaced by esbuild define.
     * @see {@link ../../esbuild.config.js}
     * @see {@link https://esbuild.github.io/api/#define | esbuild define}
     * @see {@link https://docs.npmjs.com/cli/v9/using-npm/scripts#packagejson-vars | package.json vars}
     */
    const WRANGLER_VERSION = process.env.npm_package_dependencies_wrangler
    strict(WRANGLER_VERSION, 'wrangler version should exist')
    /**
     * Tried to use wrangler.unstable_pages.deploy. But wrangler is 8mb+ and the bundler is unable to tree shake it.
     */
    const {stdout} = await execAsync(
      `npx wrangler@${WRANGLER_VERSION} pages deploy ${directory} --project-name=${projectName} --branch=${branch} --commit-dirty=true --commit-hash=${commitHash}`,
      {
        env: process.env,
        cwd: workingDirectory
      }
    )
    /**
     * Log out wrangler output.
     */
    info(stdout)
    /**
     * Get the latest deployment by commitHash and poll until required status.
     */
    const {deployment, status} = await statusCloudflareDeployment({
      accountId,
      projectName
    })

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
