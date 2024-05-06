import {getInput} from '@actions/core'

import {INPUT_KEYS_KEEP_LATEST} from '@/input-keys'

export interface Inputs {
  /** How many deployments to keep. */
  keepLatest: number
}

const getInputs = (): Inputs => {
  return {
    keepLatest: Number(
      getInput(INPUT_KEYS_KEEP_LATEST, {required: false, trimWhitespace: true})
    )
  }
}

type UseInputs = ReturnType<typeof getInputs>

let _inputs: UseInputs

export const useInputs = (): UseInputs => {
  return process.env.NODE_ENV === 'test'
    ? getInputs()
    : _inputs ?? (_inputs = getInputs())
}
