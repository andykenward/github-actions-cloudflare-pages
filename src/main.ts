import {debug, getInput, setFailed, setOutput} from '@actions/core'
import {wait} from './wait'

async function run(): Promise<void> {
  try {
    const ms: string = getInput('milliseconds')
    debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    debug(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    debug(new Date().toTimeString())

    setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) setFailed(error.message)
  }
}

run()
