import {debug} from '@unlike/github-actions-core'

import {getCloudflareLatestDeployment} from '@/src/cloudflare/deployment/get.js'

import type {PagesDeployment} from '../types.js'

const ERROR_KEY = `Status Of Deployment:`

type DeploymentStatus = PagesDeployment['stages'][number]['status']

export const statusCloudflareDeployment = async (): Promise<{
  deployment: PagesDeployment
  status: DeploymentStatus
}> => {
  let deploymentStatus: DeploymentStatus | undefined
  let deployment
  do {
    try {
      deployment = await getCloudflareLatestDeployment()
      const deployStage = deployment.stages.find(
        stage => stage.name === 'deploy'
      )

      deploymentStatus = deployStage?.status

      debug(JSON.stringify(deployStage))

      switch (deployStage?.status) {
        case 'active':
        case 'success': {
          break
        }
        case 'failure':
        case 'skipped':
        case 'canceled': {
          break
        }
        default: {
          await new Promise(resolve => setTimeout(resolve, 1000))
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
  } while (deploymentStatus !== 'success')

  return {deployment, status: deploymentStatus}
}
