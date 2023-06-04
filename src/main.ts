/* eslint-disable no-console */

import {useContext} from './github/context.js'

export function run() {
  const context = useContext()

  console.dir(context)

  if (context.eventName === 'pull_request') {
    console.dir(context.payload.pull_request)
  }

  // const branch: string =
  //   process.env.GITHUB_HEAD_REF ||
  //   process.env.GITHUB_REF_NAME ||
  //   'unknown-branch'
  // const commitHash = process.env.GITHUB_SHA

  // const githubToken = getInput('GITHUB_TOKEN', {required: true})

  // const octokit = github.getOctokit(githubToken)

  // octokit.graphql(`query RepoDeployment`)

  // octokit.rest.repos.listDeployments()
}
