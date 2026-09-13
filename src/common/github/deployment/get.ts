import * as Effect from 'effect/Effect'

import {GitHubRestApi} from '../api/paginate.js'
import {GitHubContext} from '../context.js'

/**
 * Every GitHub deployment of the context branch, newest first — limited to
 * `environment` when given, else across all environments.
 */
export const getGitHubDeployments = Effect.fn('getGitHubDeployments')(
  function* ({environment}: {environment: string | undefined}) {
    const {repo, branch} = yield* GitHubContext
    const github = yield* GitHubRestApi

    return yield* github.paginate('GET /repos/{owner}/{repo}/deployments', {
      owner: repo.owner,
      repo: repo.repo,
      ref: branch,
      per_page: 100,
      environment
    })
  }
)

export type GitHubDeployment = Effect.Success<
  ReturnType<typeof getGitHubDeployments>
>[number]
