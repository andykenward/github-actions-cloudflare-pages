import {debug} from '@actions/core'

import type {CloudflareApiEndpoint} from '../api/endpoints.js'
import type {PagesDeployment} from '../types.js'

import {getCloudflareLatestDeployment} from './get.js'

const ERROR_KEY = `Status Of Deployment:`

type DeploymentStatus = Exclude<
  PagesDeployment['stages'][number]['status'],
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
      const deployStage = deployment.stages.find(
        stage => stage.name === 'deploy'
      )

      debug(JSON.stringify(deployStage))

      switch (deployStage?.status) {
        case 'active':
        case 'success':
        case 'failure':
        case 'skipped':
        case 'canceled': {
          deploymentStatus = deployStage.status
          break
        }
        default: {
          await new Promise(resolve =>
            setTimeout(resolve, process.env.NODE_ENV === 'test' ? 1 : 1000)
          )
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
        throw new Error(error.stderr)
      }
      throw new Error(`${ERROR_KEY} unknown error`)
    }
  } while (deploymentStatus === 'unknown')

  return {deployment, status: deploymentStatus}
}
