import {exec} from 'node:child_process'
import {existsSync} from 'node:fs'
import {normalize} from 'node:path'
import {promisify} from 'node:util'

import {setFailed} from '@unlike/github-actions-core'

export const raise = (message: string): never => {
  throw new Error(message)
}

export const raiseFail = (message: string): never => {
  setFailed(message)
  throw new Error(message)
}

export const execAsync = promisify(exec)

export const checkWorkingDirectory = (directory = '.'): string => {
  const p = normalize(directory)
  if (existsSync(p)) {
    return p
  }
  throw new Error(`Directory not found: ${directory}`)
}
