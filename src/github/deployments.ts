import type {PaginateResponse} from './api/paginate.js'
import {paginate} from './api/paginate.js'
import {useContext} from './context.js'

/**
 * Get all github deployments from the current repo ref
 */
export const getDeployments = async (): Promise<
  PaginateResponse<'GET /repos/{owner}/{repo}/deployments'>
> => {
  const {repo, ref} = useContext()

  const deployments = await paginate('GET /repos/{owner}/{repo}/deployments', {
    owner: repo.owner,
    repo: repo.repo,
    ref: ref,
    per_page: 100
  })

  return deployments
}
