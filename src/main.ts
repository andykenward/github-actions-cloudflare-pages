/* eslint-disable no-console */

import {useContextEvent} from './github/context.js'

export function run() {
  const event = useContextEvent()

  if (event.eventName === 'pull_request') {
    console.dir(event.payload.pull_request)
  } else {
    console.log('not a pull request')
    console.log(JSON.stringify(event))
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
