/* eslint-disable no-console */

// import {createDeployment} from './cloudflare/project/create-deployment.js'

import {createDeployment} from './cloudflare/deployments.js'
import {getProject} from './cloudflare/project/get-project.js'
import {useContextEvent} from './github/context.js'
import {createEnvironment} from './github/environment.js'

export async function run() {
  /**
   * Get Cloudflare project
   */
  const {name, subdomain} = await getProject()

  const deployment = await createDeployment()

  const {eventName} = useContextEvent()

  if (eventName === 'pull_request') {
    const environment = await createEnvironment()
    // github deployment
  }

  return {name, subdomain, url: deployment.url}
}
