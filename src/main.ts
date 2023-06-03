/* eslint-disable no-console */
// import {
//   // createDeployment,
//   createDeployment
// } from './cloudflare/project/create-deployment.js'

import {context} from '@actions/github'

// import {getDeployments} from './cloudflare/project/get-deployments.js'

// import {getDeployments} from './cloudflare/project/get-deployments.js'
// import {getProject} from './cloudflare/project/get-project.js'

export function run() {
  /**
   * See if we can get the Cloudflare Pages project
   */

  const branch: string =
    process.env.GITHUB_HEAD_REF ||
    process.env.GITHUB_REF_NAME ||
    'unknown-branch'
  const commitHash = process.env.GITHUB_SHA

  console.log(branch)
  console.log(commitHash)

  console.log(context)

  console.log(context.payload)

  context.payload.action
  context.payload.pull_request
  // const project = await getProject()
  // const deploy = await createDeployment()
  // console.log(deploy)

  // const deployments = await getDeployments()
  // console.log('deployments', deployments)

  // GET GITHUB DEPLOYMENTS

  // setOutput('url', deployment.url)
  // setOutput('environment', deployment.environment)
}

// CONTEXT
