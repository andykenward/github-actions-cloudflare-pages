import {exec} from 'node:child_process'
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
