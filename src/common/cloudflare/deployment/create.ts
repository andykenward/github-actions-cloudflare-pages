import {setOutput, summary} from '@actions/core'
import * as Effect from 'effect/Effect'
import * as Predicate from 'effect/Predicate'
import * as Schema from 'effect/Schema'

import {errorMessage} from '@/common/errors.js'
import {GitHubContext} from '@/common/github/context.js'
import {CommonInputs, secret} from '@/common/inputs.js'
import {execFileAsync, logVerbatim} from '@/common/utils.js'

import type {StatusOptions} from './status.js'

import {getCloudflareDeploymentAlias} from './get.js'
import {statusCloudflareDeployment} from './status.js'

export const CLOUDFLARE_API_TOKEN = 'CLOUDFLARE_API_TOKEN'
export const CLOUDFLARE_ACCOUNT_ID = 'CLOUDFLARE_ACCOUNT_ID'
const ERROR_KEY = `Create Deployment:`

// oxlint-disable-next-line unicorn/throw-new-error
class CreateDeploymentError extends Schema.TaggedError<CreateDeploymentError>()(
  'CreateDeploymentError',
  {
    message: Schema.String,
    cause: Schema.Defect()
  }
) {
  static readonly from = (cause: unknown): CreateDeploymentError =>
    new CreateDeploymentError({message: errorMessage(cause), cause})

  /**
   * A rejected `execFile` is an `Error` whose message already includes
   * wrangler's stderr. Anything else is reported by its `stderr`, if it has
   * one.
   */
  static readonly fromWrangler = (cause: unknown): CreateDeploymentError => {
    if (cause instanceof Error) {
      return CreateDeploymentError.from(cause)
    }
    if (
      Predicate.hasProperty(cause, 'stderr') &&
      Predicate.isString(cause.stderr)
    ) {
      return new CreateDeploymentError({message: cause.stderr, cause})
    }
    return new CreateDeploymentError({
      message: `${ERROR_KEY} unknown error`,
      cause
    })
  }
}

export const createCloudflareDeployment = Effect.fn(
  'createCloudflareDeployment'
)(function* ({
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
}) {
  const {cloudflareApiToken, wranglerVersion} = yield* CommonInputs
  const {repo, branch: contextBranch, sha: commitHash} = yield* GitHubContext

  const branch = branchOverride ?? contextBranch

  if (branch === undefined) {
    return yield* new CreateDeploymentError({
      message: `${ERROR_KEY} branch is undefined`,
      cause: undefined
    })
  }

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

  /**
   * Tried to use wrangler.unstable_pages.deploy. But wrangler is 8mb+ and the bundler is unable to tree shake it.
   */
  const {stdout} = yield* Effect.tryPromise({
    try: () =>
      execFileAsync(
        'npx',
        [
          `wrangler@${wranglerVersion}`,
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
      ),
    catch: CreateDeploymentError.fromWrangler
  })
  /**
   * Log out wrangler output.
   */
  logVerbatim(stdout)
  /**
   * Get the latest deployment by commitHash and poll until required status.
   */
  const {deployment, status} = yield* statusCloudflareDeployment(
    {accountId, projectName},
    statusOptions
  )

  setOutput('id', deployment.id)
  setOutput('url', deployment.url)
  setOutput('environment', deployment.environment)

  const alias: string = getCloudflareDeploymentAlias(deployment)
  setOutput('alias', alias)
  setOutput('wrangler', stdout)

  yield* Effect.tryPromise({
    try: () =>
      summary
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
        .write(),
    catch: CreateDeploymentError.from
  })

  return {deployment, wranglerOutput: stdout}
})
