import {env} from 'node:process'

import {setOutput} from '@actions/core'

import {getProject} from './cloudflare/project/get-project.js'

export async function run(): Promise<string> {
  const githubBranch = env.GITHUB_HEAD_REF || env.GITHUB_REF_NAME

  const project = await getProject()

  const productionEnvironment: boolean =
    githubBranch === project.production_branch

  // TODO use core https://github.com/actions/toolkit/blob/main/docs/action-debugging.md#step-debug-logs
  console.log('isProduction', productionEnvironment)

  setOutput('subdomain', project.subdomain)
  return project.name
}
