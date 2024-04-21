import {setFailed} from '@actions/core'

import {run} from './main.js'

try {
  void run()
} catch (error) {
  if (error instanceof Error) setFailed(error.message)
}
