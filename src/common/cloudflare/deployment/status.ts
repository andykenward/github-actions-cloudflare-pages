import {debug} from '@actions/core'

import {sleep} from '@/common/utils.js'

import type {CloudflareApiEndpoint} from '../api/endpoints.js'
import type {PagesDeployment} from '../types.js'

import {getCloudflareLatestDeployment} from './get.js'

const ERROR_KEY = `Status Of Deployment:`

type DeploymentStatus = Exclude<
  PagesDeployment['latest_stage']['status'],
  'idle'
>

export const statusCloudflareDeployment = async (
  apiEndpoint: CloudflareApiEndpoint
): Promise<{
  deployment: PagesDeployment
  status: DeploymentStatus
}> => {
  let deploymentStatus: DeploymentStatus | 'unknown' = 'unknown'
  let deployment
  do {
    try {
      deployment = await getCloudflareLatestDeployment(apiEndpoint)
      const {latest_stage} = deployment

      debug(JSON.stringify(latest_stage))

      switch (latest_stage.status) {
        case 'failure':
        case 'canceled': {
          deploymentStatus = latest_stage.status
          break
        }
        case 'active':
        case 'success': {
          if (latest_stage.name === 'deploy') {
            deploymentStatus = latest_stage.status
            break
          }
          await sleep(1000)
          break
        }
        default: {
          await sleep(1000)
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      if (
        error &&
        typeof error === 'object' &&
        'stderr' in error &&
        typeof error.stderr === 'string'
      ) {
        throw new Error(error.stderr, {cause: error})
      }
      throw new Error(`${ERROR_KEY} unknown error`, {cause: error})
    }
  } while (deploymentStatus === 'unknown')

  return {deployment, status: deploymentStatus}
}
