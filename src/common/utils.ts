import {execFile} from 'node:child_process'
import {randomUUID} from 'node:crypto'
import {existsSync} from 'node:fs'
import path from 'node:path'
import {promisify} from 'node:util'

import {info} from '@actions/core'

/**
 * Logs another tool's output without the runner acting on it: a line in it
 * starting with `::` would otherwise be processed as a workflow command. The
 * end token is random per call, so the output cannot close the block early.
 * @see https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-commands#stopping-and-starting-workflow-commands
 */
export const logVerbatim = (output: string): void => {
  const token = randomUUID()
  info(`::stop-commands::${token}`)
  info(output)
  info(`::${token}::`)
}

export const raise = (message: string): never => {
  throw new Error(message)
}

export const execFileAsync = promisify(execFile)

export const checkWorkingDirectory = (directory = '.'): string => {
  const p = path.normalize(directory)
  if (existsSync(p)) {
    return p
  }
  throw new Error(`Directory not found: ${directory}`)
}
