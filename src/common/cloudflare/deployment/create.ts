import {setOutput} from '@actions/core'
import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import {getCloudflareLogEndpoint} from '@/common/cloudflare/api/endpoints.js'
import {errorMessage} from '@/common/errors.js'
import {GitHubContext} from '@/common/github/context.js'
import {code, escapeHtml, githubUrl, link} from '@/common/html.js'
import {CommonInputs} from '@/common/inputs.js'
import {writeSummary} from '@/common/summary.js'
import {logVerbatim} from '@/common/utils.js'

import type {StatusOptions} from './status.js'

import {getCloudflareDeploymentAlias} from './get.js'
import {statusCloudflareDeployment} from './status.js'
import {wranglerPagesDeploy} from './wrangler.js'

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

  const {stdout, deploymentId} = yield* wranglerPagesDeploy({
    wranglerVersion,
    apiToken: cloudflareApiToken,
    accountId,
    projectName,
    directory,
    branch,
    commitHash,
    workingDirectory
  })
  /**
   * Log out wrangler output.
   */
  logVerbatim(stdout)
  /**
   * Poll the deployment wrangler created until it reaches a terminal stage.
   */
  const {deployment, status} = yield* statusCloudflareDeployment(
    {accountId, projectName, deploymentId},
    statusOptions
  )

  setOutput('id', deployment.id)
  setOutput('url', deployment.url)
  setOutput('environment', deployment.environment)

  const alias: string = getCloudflareDeploymentAlias(deployment)
  setOutput('alias', alias)
  setOutput('wrangler', stdout)

  const {metadata} = deployment.deployment_trigger

  yield* writeSummary(
    summary =>
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
          ['Environment:', escapeHtml(deployment.environment)],
          [
            'Branch:',
            link(
              githubUrl(repo.owner, repo.repo, 'tree', metadata.branch),
              code(metadata.branch)
            )
          ],
          [
            'Commit Hash:',
            link(
              githubUrl(repo.owner, repo.repo, 'commit', metadata.commit_hash),
              code(metadata.commit_hash)
            )
          ],
          ['Commit Message:', escapeHtml(metadata.commit_message)],
          [
            'Status:',
            `<strong>${escapeHtml(status.toUpperCase() || 'UNKNOWN')}</strong>`
          ],
          ['Preview URL:', link(deployment.url, escapeHtml(deployment.url))],
          ['Branch Preview URL:', link(alias, escapeHtml(alias))],
          ['Wrangler Output:', escapeHtml(stdout)]
        ]),
    CreateDeploymentError.from
  )

  /**
   * A failed or canceled build used to fall through to the pull request
   * comment and a `SUCCESS` GitHub Deployment, so a broken deploy looked green.
   * Fail once the outputs and summary are written, so both still show it.
   */
  if (status === 'failure' || status === 'canceled') {
    const outcome = status === 'failure' ? 'failed' : 'was canceled'
    const logUrl = getCloudflareLogEndpoint({
      id: deployment.id,
      accountId,
      projectName
    })
    return yield* new CreateDeploymentError({
      message: `${ERROR_KEY} the Cloudflare Pages build ${outcome}. Build log: ${logUrl}`,
      cause: undefined
    })
  }

  return {deployment, wranglerOutput: stdout}
})
