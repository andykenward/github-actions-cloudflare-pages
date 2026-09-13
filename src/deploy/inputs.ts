import type * as Effect from 'effect/Effect'

import {existsSync} from 'node:fs'
import path from 'node:path'

import * as Config from 'effect/Config'
import * as Context from 'effect/Context'
import {identity} from 'effect/Function'
import * as Layer from 'effect/Layer'
import * as Option from 'effect/Option'
import * as Schema from 'effect/Schema'
import * as SchemaTransformation from 'effect/SchemaTransformation'

import {
  BooleanInput,
  input,
  optionalInput,
  readInputs
} from '@/common/config/provider.js'
import {
  cloudflareAccountIdConfig,
  cloudflareProjectNameConfig,
  wranglerVersionConfig
} from '@/common/inputs.js'
import {
  INPUT_KEY_BRANCH,
  INPUT_KEY_WRANGLER_COMMENT_OUTPUT,
  INPUT_KEY_DIRECTORY,
  INPUT_KEY_GITHUB_ENVIRONMENT,
  INPUT_KEY_PR_NUMBER,
  INPUT_KEY_WORKING_DIRECTORY
} from '@/input-keys'

/**
 * A directory that exists, normalised. Blank means the current directory, so
 * a whitespace-only input gets the default like an absent one. Failing as a
 * schema check — rather than throwing inside `Config.map` — reports it as an
 * invalid input instead of a defect.
 */
const WorkingDirectory = Schema.Trim.check(
  Schema.makeFilter(
    (directory: string) =>
      directory === '' ||
      existsSync(directory) ||
      `Directory not found: ${directory}`
  )
).pipe(
  Schema.decodeTo(
    Schema.String,
    SchemaTransformation.transform({
      decode: (directory: string) => path.normalize(directory || '.'),
      encode: identity
    })
  )
)

/** GraphQL's `Int`, which `GetPullRequestId` takes the number as. */
const PULL_REQUEST_NUMBER_MAX = 2_147_483_647

/** A pull request number: a positive whole number that fits a GraphQL `Int`. */
const PullRequestNumber = Schema.Int.check(
  Schema.isGreaterThan(0),
  Schema.isLessThanOrEqualTo(PULL_REQUEST_NUMBER_MAX)
)

const deployConfig = Config.all({
  /** Cloudflare Account Id */
  cloudflareAccountId: cloudflareAccountIdConfig,
  /** Cloudflare Pages Project Name */
  cloudflareProjectName: cloudflareProjectNameConfig,
  /** Directory of static files to upload */
  directory: input(INPUT_KEY_DIRECTORY),
  workingDirectory: Config.schema(
    WorkingDirectory,
    INPUT_KEY_WORKING_DIRECTORY
  ).pipe(Config.withDefault('.')),
  /** Branch name override for Cloudflare Pages; `undefined` means none. */
  branch: optionalInput(INPUT_KEY_BRANCH),
  /** GitHub Environment to record the deployment under. */
  gitHubEnvironment: input(INPUT_KEY_GITHUB_ENVIRONMENT),
  /** Pull request to comment on; `undefined` means detect it from the event. */
  pullRequestNumber: Config.schema(PullRequestNumber, INPUT_KEY_PR_NUMBER).pipe(
    Config.option,
    Config.map(number => Option.getOrUndefined(number))
  ),
  /** Wrangler version to install. */
  wranglerVersion: wranglerVersionConfig,
  /** Whether the pull request comment includes wrangler's output. */
  wranglerCommentOutput: Config.schema(
    BooleanInput,
    INPUT_KEY_WRANGLER_COMMENT_OUTPUT
  ).pipe(Config.withDefault(true))
})

/** Inputs only the deploy action uses. See `CommonInputs` on memoisation. */
export class DeployInputs extends Context.Service<
  DeployInputs,
  Effect.Success<typeof deployConfig>
>()('github-actions-cloudflare-pages/deploy/inputs/DeployInputs') {
  static readonly layer = Layer.effect(DeployInputs, readInputs(deployConfig))
}
