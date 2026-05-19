import {exec, execFile} from 'node:child_process'
import {existsSync} from 'node:fs'
import path from 'node:path'
import {promisify} from 'node:util'

import {setFailed} from '@actions/core'

export const raise = (message: string): never => {
  throw new Error(message)
}

export const raiseFail = (message: string): never => {
  setFailed(message)
  throw new Error(message)
}

export const execAsync = promisify(exec)
export const execFileAsync = promisify(execFile)
export const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms))

export const checkWorkingDirectory = (directory = '.'): string => {
  const p = path.normalize(directory)
  if (existsSync(p)) {
    return p
  }
  throw new Error(`Directory not found: ${directory}`)
}
