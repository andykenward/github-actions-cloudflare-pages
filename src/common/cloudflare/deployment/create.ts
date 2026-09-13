import {setOutput} from '@actions/core'
import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import type {PagesDeployment} from '@/common/cloudflare/types.js'
import type {Repo} from '@/common/github/context.js'
import type {Summary} from '@/common/summary.js'

import {getCloudflareLogEndpoint} from '@/common/cloudflare/api/endpoints.js'
import {errorMessage} from '@/common/errors.js'
import {GitHubContext} from '@/common/github/context.js'
import {code, escapeHtml, githubUrl, headerRow, link} from '@/common/html.js'
import {CommonInputs} from '@/common/inputs.js'
import {writeSummary} from '@/common/summary.js'
import {logVerbatim} from '@/common/utils.js'

import {getCloudflareDeploymentAlias} from './get.js'
import {statusCloudflareDeployment} from './status.js'
import {wranglerPagesDeploy} from './wrangler.js'

const PREFIX = `Create Deployment:`

// oxlint-disable-next-line unicorn/throw-new-error
class CreateDeploymentError extends Schema.TaggedError<CreateDeploymentError>()(
  'CreateDeploymentError',
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Defect())
  }
) {
  /** Prefixed, so a failed summary write is attributable in the annotation. */
  static readonly from = (cause: unknown): CreateDeploymentError =>
    new CreateDeploymentError({
      message: `${PREFIX} ${errorMessage(cause)}`,
      cause
    })

  /** The build ended `failure` or `canceled`; the message links its log. */
  static readonly buildEnded = (
    status: 'failure' | 'canceled',
    deployment: PagesDeployment,
    endpoint: {accountId: string; projectName: string}
  ): CreateDeploymentError => {
    const outcome = status === 'failure' ? 'failed' : 'was canceled'
    const logUrl = getCloudflareLogEndpoint({id: deployment.id, ...endpoint})
    return new CreateDeploymentError({
      message: `${PREFIX} the Cloudflare Pages build ${outcome}. Build log: ${logUrl}`
    })
  }
}

/** The action's outputs, once the deployment reached a terminal stage. */
const createCloudflareDeploymentOutputs = (
  deployment: PagesDeployment,
  alias: string,
  stdout: string
): void => {
  setOutput('id', deployment.id)
  setOutput('url', deployment.url)
  setOutput('environment', deployment.environment)
  setOutput('alias', alias)
  setOutput('wrangler', stdout)
}

/** The job summary table; every cell is built with `src/common/html.ts`. */
const createCloudflareDeploymentSummary =
  ({
    deployment,
    status,
    alias,
    stdout,
    repo
  }: {
    deployment: PagesDeployment
    status: string
    alias: string
    stdout: string
    repo: Repo
  }) =>
  (summary: Summary): Summary => {
    const {metadata} = deployment.deployment_trigger

    return summary
      .addHeading('Cloudflare Pages Deployment')
      .addBreak()
      .addTable([
        headerRow('Name', 'Result'),
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
        ['Status:', `<strong>${escapeHtml(status.toUpperCase())}</strong>`],
        ['Preview URL:', link(deployment.url, escapeHtml(deployment.url))],
        ['Branch Preview URL:', link(alias, escapeHtml(alias))],
        ['Wrangler Output:', escapeHtml(stdout)]
      ])
  }

export const createCloudflareDeployment = Effect.fn(
  'createCloudflareDeployment'
)(function* ({
  accountId,
  projectName,
  directory,
  workingDirectory = '',
  branch: branchOverride,
  wranglerVersion
}: {
  accountId: string
  projectName: string
  directory: string
  workingDirectory?: string
  branch?: string
  wranglerVersion: string
}) {
  const {cloudflareApiToken} = yield* CommonInputs
  const {repo, branch: contextBranch, sha: commitHash} = yield* GitHubContext

  const branch = branchOverride ?? contextBranch

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
  logVerbatim(stdout)

  // Poll the deployment wrangler created until it reaches a terminal stage.
  const {deployment, status} = yield* statusCloudflareDeployment({
    accountId,
    projectName,
    deploymentId
  })

  const alias = getCloudflareDeploymentAlias(deployment)
  createCloudflareDeploymentOutputs(deployment, alias, stdout)

  yield* writeSummary(
    createCloudflareDeploymentSummary({
      deployment,
      status,
      alias,
      stdout,
      repo
    }),
    CreateDeploymentError.from
  )

  /**
   * A failed or canceled build fails the step — but only once the outputs and
   * summary are written, so both still describe it. No comment or GitHub
   * Deployment records a broken deploy as green.
   */
  if (status === 'failure' || status === 'canceled') {
    return yield* CreateDeploymentError.buildEnded(status, deployment, {
      accountId,
      projectName
    })
  }

  return {deployment, wranglerOutput: stdout}
})
