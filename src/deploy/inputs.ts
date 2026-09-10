import type * as Effect from 'effect/Effect'

import * as Config from 'effect/Config'
import * as Context from 'effect/Context'
import * as Layer from 'effect/Layer'

import {input, optionalInput, readInputs} from '@/common/config/provider.js'
import {
  cloudflareAccountIdInput,
  cloudflareProjectNameInput
} from '@/common/inputs.js'
import {checkWorkingDirectory} from '@/common/utils.js'
import {
  INPUT_KEY_DIRECTORY,
  INPUT_KEY_WORKING_DIRECTORY,
  INPUT_KEY_BRANCH
} from '@/input-keys'

const deployConfig = Config.all({
  /** Cloudflare Account Id */
  cloudflareAccountId: cloudflareAccountIdInput,
  /** Cloudflare Pages Project Name */
  cloudflareProjectName: cloudflareProjectNameInput,
  /** Directory of static files to upload */
  directory: input(INPUT_KEY_DIRECTORY),
  workingDirectory: input(INPUT_KEY_WORKING_DIRECTORY).pipe(
    Config.withDefault('.'),
    Config.map(directory => checkWorkingDirectory(directory))
  ),
  /** Branch name override for Cloudflare Pages; `undefined` means none. */
  branch: optionalInput(INPUT_KEY_BRANCH)
})

/** Inputs only the deploy action uses. See `CommonInputs` on memoisation. */
export class DeployInputs extends Context.Service<
  DeployInputs,
  Effect.Success<typeof deployConfig>
>()('github-actions-cloudflare-pages/deploy/inputs/DeployInputs') {
  static readonly layer = Layer.effect(DeployInputs, readInputs(deployConfig))
}
