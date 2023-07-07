import {readFile, writeFile} from 'node:fs/promises'

import {create} from '@actions/artifact'
import {error, notice} from '@unlike/github-actions-core'

import type {PagesDeployment} from '../cloudflare/types.js'
import {raise} from '../utils.js'
import {useContextEvent} from './context.js'

type LogData = {deployment_identifier: string}
type DataArray = Array<LogData>
const artifactClient = create()
const writeLogFile = async (artifactName: string, data: DataArray) =>
  writeFile(artifactName, JSON.stringify(data))

const uploadLogFile = async (filename: string) => {
  const artifactName = filename
  const files = [filename]
  const rootDirectory = '.'

  return await artifactClient.uploadArtifact(artifactName, files, rootDirectory)
}

export const saveLogs = async (deployment: PagesDeployment) => {
  const {eventName, payload} = useContextEvent()

  if (eventName === 'pull_request') {
    if (payload.action === 'closed') {
      // Should delete deployments and logs
      return
    }

    const artifactName =
      payload.pull_request.node_id ?? raise('No pull request node id')
    const filename = `${artifactName}.json`
    const logData: LogData = {deployment_identifier: deployment.id}

    // get existing log file
    // const logFile = await getLogFile(filename)

    // if (logFile) {
    //   debug(`Log file exists: artifactName:${logFile.artifactName}`)
    //   debug(`Log file exists: downloadPath:${logFile.downloadPath}`)
    //   const existingFileContents = await readFile(logFile.downloadPath, {
    //     encoding: 'utf8'
    //   })
    //   const parsedData = JSON.parse(existingFileContents) as DataArray
    //   parsedData.push(logData)

    //   await writeLogFile(logFile.downloadPath, parsedData)
    // } else {
    const data: DataArray = [logData]
    await writeLogFile(filename, data)
    // }

    const response = await uploadLogFile(filename)
    notice(`Artifact: - ${JSON.stringify(response)}`)
  }
}

const getLogFile = async (artifactName: string) => {
  try {
    const logFile = await artifactClient.downloadArtifact(artifactName, '.')
    return logFile
  } catch (logError) {
    error(`Logs - ${JSON.stringify(logError)}`)
  }
  return
}
