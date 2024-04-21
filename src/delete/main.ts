import {debug, info, setFailed, summary} from '@actions/core'

import {batchDelete} from '@/common/batch-delete.js'
import {getGitHubDeployments} from '@/common/github/deployment/get.js'

const PREFIX = `delete -`

export async function run() {
  const deployments = await getGitHubDeployments()

  if (deployments.length === 0) {
    info(`${PREFIX} No deployments found to delete`)

    await summary
      .addHeading('andykenward/github-actions-cloudflare-pages')
      .addBreak()
      .addTable([['No deployments found to delete']])
      .write()
    return
  }

  try {
    const values = await Promise.all(
      deployments.map(deployment => batchDelete(deployment))
    )
    debug(`${PREFIX} Deleted deployments: ${JSON.stringify(values)}`)

    if (values.length > 0) {
      await summary
        .addHeading('andykenward/github-actions-cloudflare-pages')
        .addBreak()
        .addHeading('Deleted Deployments')
        .addBreak()
        .addTable([
          [
            {data: 'GitHub Deployment Id', header: true},
            {data: 'Success', header: true},
            {data: 'Environment', header: true},
            {data: 'Environment Url', header: true},
            {data: 'Comment Id', header: true},
            {data: 'Error', header: true}
          ],
          ...values.map(value => [
            value.deploymentId,
            value.success ? '✅' : '❌',
            value.environment,
            value.environmentUrl
              ? `<a href='${value.environmentUrl}'><code>${value.environmentUrl}</code></a>`
              : '',
            value.commentId || '',
            value.error || ''
          ])
        ])
        .write()
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : JSON.stringify(error)

    setFailed(`${PREFIX} Error deleting deployments: ${message}`)
  }
}
