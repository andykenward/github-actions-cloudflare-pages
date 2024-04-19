import {useCommonInputs} from '@/common/inputs.js'

import type {PaginateResponse} from '../api/paginate.js'

import {paginate} from '../api/paginate.js'
import {useContext} from '../context.js'

/**
 * Get all github deployments from the current repo ref
 */
export const getGitHubDeployments = async (): Promise<
  PaginateResponse<'GET /repos/{owner}/{repo}/deployments'>
> => {
  const {gitHubEnvironment} = useCommonInputs()
  const {repo, branch} = useContext()

  const deployments = await paginate('GET /repos/{owner}/{repo}/deployments', {
    owner: repo.owner,
    repo: repo.repo,
    ref: branch,
    per_page: 100,
    environment: gitHubEnvironment
  })

  return deployments
}
