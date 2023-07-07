/* eslint-disable no-console */

import {createDeployment} from './cloudflare/deployments.js'
import {getProject} from './cloudflare/project/get-project.js'
import {addComment} from './github/comment.js'
import {useContextEvent} from './github/context.js'
import {createGitHubDeployment} from './github/deployment.js'
import {saveLogs} from './github/logs.js'

export async function run() {
  const {eventName, payload} = useContextEvent()

  if (eventName === 'pull_request') {
    if (payload.action === 'closed') {
      console.dir(payload)
      // Should delete deployments?
      return
    }
    /**
     * Get Cloudflare project
     */
    // TODO: refactor into cloudflare createDeployment
    const {name, subdomain} = await getProject()

    const cloudflareDeployment = await createDeployment()
    const deployment = await createGitHubDeployment(cloudflareDeployment)

    await saveLogs(cloudflareDeployment)

    await addComment(cloudflareDeployment)

    return {name, subdomain, url: cloudflareDeployment.url}
  }
}
