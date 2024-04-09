import {debug, info, setFailed} from '@unlike/github-actions-core'

import {batchDelete} from '@/common/batch-delete.js'
import {getGitHubDeployments} from '@/common/github/deployment/get.js'

const PREFIX = `delete -`

export async function run() {
  const deployments = await getGitHubDeployments()

  if (deployments.length === 0) {
    info(`${PREFIX} No deployments found to delete`)
    return
  }

  try {
    const values = await Promise.all(
      deployments.map(deployment => batchDelete(deployment))
    )
    debug(`${PREFIX} Deleted deployments: ${JSON.stringify(values)}`)
  } catch (error) {
    setFailed(`${PREFIX} Error deleting deployments: ${JSON.stringify(error)}`)
  }
}
