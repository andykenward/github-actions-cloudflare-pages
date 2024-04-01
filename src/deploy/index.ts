import {setFailed} from '@unlike/github-actions-core'

import {run} from './main.js'

try {
  void run()
} catch (error) {
  // TODO: check setFailed
  if (error instanceof Error) setFailed(error.message)
}
