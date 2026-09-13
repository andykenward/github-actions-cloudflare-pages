import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import {GitHubApiError} from '../api/client.js'
import {GitHubRestApi, PAGE_SIZE} from '../api/paginate.js'
import {GitHubContext} from '../context.js'
import {GitHubDeployment} from './types.js'

export type {GitHubDeployment} from './types.js'

const decodeDeployments = Schema.decodeUnknownEffect(
  Schema.Array(GitHubDeployment)
)

/**
 * Every GitHub deployment of the context branch, newest first — limited to
 * `environment` when given, else across all environments. REST, because
 * GraphQL's `deployments` can't filter by branch, and its `ref` is `null`
 * once the branch is deleted — as it usually is when the delete action runs.
 */
export const getGitHubDeployments = Effect.fn('getGitHubDeployments')(
  function* ({environment}: {environment: string | undefined}) {
    const {repo, branch} = yield* GitHubContext
    const github = yield* GitHubRestApi

    const listed = yield* github.paginate(
      `/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.repo)}/deployments`,
      {ref: branch, per_page: PAGE_SIZE, environment}
    )

    return yield* decodeDeployments(listed).pipe(
      Effect.mapError(GitHubApiError.from)
    )
  }
)
