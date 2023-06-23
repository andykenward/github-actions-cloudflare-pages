/* eslint-disable no-console */

// import {createDeployment} from './cloudflare/project/create-deployment.js'

import {createDeployment} from './cloudflare/deployments.js'
import {getProject} from './cloudflare/project/get-project.js'

export async function run() {
  /**
   * Get Cloudflare project
   */
  const {name, subdomain} = await getProject()

  const deployment = await createDeployment()

  return {name, subdomain, url: deployment.url}
}
