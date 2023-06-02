import {setOutput} from '@actions/core'

import {createDeployment} from './cloudflare/project/create-deployment.js'
import {getProject} from './cloudflare/project/get-project.js'

export async function run(): Promise<void> {
  /**
   * See if we can get the Cloudflare Pages project
   */
  const project = await getProject()

  /**
   * Deploy
   */
  const deployment = await createDeployment()

  setOutput('url', deployment.url)
  setOutput('environment', deployment.environment)
}
