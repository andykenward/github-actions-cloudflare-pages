import {debug, info, setFailed, summary} from '@unlike/github-actions-core'

import {batchDelete} from '@/common/batch-delete.js'
import {getGitHubDeployments} from '@/common/github/deployment/get.js'

const PREFIX = `delete -`

export async function run() {
  const deployments = await getGitHubDeployments()

  if (deployments.length === 0) {
    info(`${PREFIX} No deployments found to delete`)

    await summary
      .addHeading('unlike-ltd/github-actions-cloudflare-pages')
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
        .addHeading('unlike-ltd/github-actions-cloudflare-pages')
        .addBreak()
        .addHeading('Deleted Deployments')
        .addBreak()
        .addTable([
          [
            {data: 'deploymentId', header: true},
            {data: 'success', header: true},
            {data: 'environment', header: true},
            {data: 'environmentUrl', header: true},
            {data: 'commentId', header: true},
            {data: 'error', header: true}
          ],
          ...values.map(value => [
            value.deploymentId,
            value.success.toString(),
            value.environment,
            value.environmentUrl || '',
            value.commentId || '',
            value.error || ''
          ])
        ])
        .write()
    }
  } catch (error) {
    setFailed(`${PREFIX} Error deleting deployments: ${JSON.stringify(error)}`)
  }
}
