import {exec} from 'node:child_process'
import {promisify} from 'node:util'

export const raise = (message: string): never => {
  throw new Error(message)
}

export const execAsync = promisify(exec)
