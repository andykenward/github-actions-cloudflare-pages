/* eslint-disable no-console */

import {createDeployment} from './cloudflare/deployments.js'
import {getProject} from './cloudflare/project/get-project.js'
import {deleteDeployments} from './delete.js'
import {
  addComment,
  createGitHubDeployment,
  useContextEvent
} from './github/index.js'

export async function run() {
  const {eventName, payload} = useContextEvent()

  /**
   * Only support eventName push & pull_request.
   */
  if (eventName !== 'push' && eventName !== 'pull_request') return

  /**
   * Validate Cloudflare project
   */
  await getProject()

  if (eventName === 'pull_request' && payload.action === 'closed') {
    await deleteDeployments()
    return
  }

  const cloudflareDeployment = await createDeployment()
  const commentId = await addComment(cloudflareDeployment)
  await createGitHubDeployment(cloudflareDeployment, commentId)
}
