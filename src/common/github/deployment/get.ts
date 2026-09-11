import * as Effect from 'effect/Effect'

import {CommonInputs} from '@/common/inputs.js'

import {GitHubRestApi} from '../api/paginate.js'
import {GitHubContext} from '../context.js'

/**
 * Get all github deployments from the current repo ref
 */
export const getGitHubDeployments = Effect.gen(function* () {
  const {gitHubEnvironment} = yield* CommonInputs
  const {repo, branch} = yield* GitHubContext
  const github = yield* GitHubRestApi

  return yield* github.paginate('GET /repos/{owner}/{repo}/deployments', {
    owner: repo.owner,
    repo: repo.repo,
    ref: branch,
    per_page: 100,
    environment: gitHubEnvironment
  })
})

export type GitHubDeployment = Effect.Success<
  typeof getGitHubDeployments
>[number]
