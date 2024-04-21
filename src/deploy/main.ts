/* eslint-disable no-console */

import {setFailed} from '@actions/core'

import {createCloudflareDeployment} from '@/common/cloudflare/deployment/create.js'
import {addComment} from '@/common/github/comment.js'
import {useContextEvent} from '@/common/github/context.js'
import {createGitHubDeployment} from '@/common/github/deployment/create.js'

import {useInputs} from './inputs.js'

export async function run() {
  const {
    cloudflareAccountId,
    cloudflareProjectName,
    directory,
    workingDirectory
  } = useInputs()
  const {eventName} = useContextEvent()

  /**
   * Only support eventName push & pull_request.
   */
  if (eventName !== 'push' && eventName !== 'pull_request') {
    setFailed(`GitHub Action event name '${eventName}' not supported.`)
    return
  }

  const {deployment: cloudflareDeployment, wranglerOutput} =
    await createCloudflareDeployment({
      accountId: cloudflareAccountId,
      projectName: cloudflareProjectName,
      directory,
      workingDirectory
    })
  const commentId = await addComment(cloudflareDeployment, wranglerOutput)

  await createGitHubDeployment({
    cloudflareDeployment,
    commentId,
    cloudflareAccountId
  })
}
