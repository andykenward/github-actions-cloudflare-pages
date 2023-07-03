/* eslint-disable no-console */

// import {createDeployment} from './cloudflare/project/create-deployment.js'

import {createDeployment} from './cloudflare/deployments.js'
import {getProject} from './cloudflare/project/get-project.js'
import {useContextEvent} from './github/context.js'
import {createGitHubDeployment} from './github/deployment.js'
import {checkEnvironment} from './github/environment.js'

export async function run() {
  /**
   * Get Cloudflare project
   */
  const {name, subdomain} = await getProject()

  const cloudflareDeployment = await createDeployment()

  const {eventName, payload} = useContextEvent()

  if (eventName === 'pull_request') {
    if (payload.action === 'closed') {
      console.dir(payload)
      // Should delete deployments?
      return
    }

    const environment = await checkEnvironment()
    console.log(environment)

    await createGitHubDeployment(cloudflareDeployment)
  }

  return {name, subdomain, url: cloudflareDeployment.url}
}
