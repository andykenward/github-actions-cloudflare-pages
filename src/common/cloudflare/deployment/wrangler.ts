import type * as Redacted from 'effect/Redacted'

import assert from 'node:assert/strict'
import {mkdtemp, readFile, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'

import {debug} from '@actions/core'
import * as Arr from 'effect/Array'
import * as Context from 'effect/Context'
import * as Duration from 'effect/Duration'
import * as Effect from 'effect/Effect'
import {pipe} from 'effect/Function'
import * as Option from 'effect/Option'
import * as Predicate from 'effect/Predicate'
import * as Schema from 'effect/Schema'

import {errorMessage} from '@/common/errors.js'
import {secret} from '@/common/inputs.js'
import {execFileAsync} from '@/common/utils.js'

export const CLOUDFLARE_API_TOKEN = 'CLOUDFLARE_API_TOKEN'
export const CLOUDFLARE_ACCOUNT_ID = 'CLOUDFLARE_ACCOUNT_ID'

/**
 * Wrangler appends one JSON object per line to this file for each event it
 * reports.
 */
export const WRANGLER_OUTPUT_FILE_PATH = 'WRANGLER_OUTPUT_FILE_PATH'

const PREFIX = `Wrangler:`

/**
 * A safety net, not the expected duration: the documented job
 * `timeout-minutes` is 15, so this only ends an upload on a job with no
 * timeout of its own, where wrangler would otherwise run for GitHub's 6 hours.
 */
const WRANGLER_TIMEOUT_MINUTES = 30

/** How long `wrangler pages deploy` may run before the step fails. */
export const WranglerTimeout = Context.Reference<Duration.Duration>(
  'github-actions-cloudflare-pages/common/cloudflare/deployment/wrangler/WranglerTimeout',
  {defaultValue: () => Duration.minutes(WRANGLER_TIMEOUT_MINUTES)}
)

// oxlint-disable-next-line unicorn/throw-new-error
class WranglerError extends Schema.TaggedError<WranglerError>()(
  'WranglerError',
  {
    message: Schema.String,
    cause: Schema.Defect()
  }
) {
  /**
   * Wrangler's own stderr is the message when there is one: a rejected
   * `execFile` carries it, and its `Error` message only prepends the command
   * line. A spawn failure has an empty stderr, so its `Error` message
   * (e.g. `ENOENT`) is used instead.
   */
  static readonly from = (cause: unknown): WranglerError => {
    if (
      Predicate.hasProperty(cause, 'stderr') &&
      Predicate.isString(cause.stderr) &&
      cause.stderr !== ''
    ) {
      return new WranglerError({message: cause.stderr, cause})
    }
    if (cause instanceof Error) {
      return new WranglerError({message: errorMessage(cause), cause})
    }
    return new WranglerError({message: `${PREFIX} unknown error`, cause})
  }
}

/**
 * The entry wrangler writes once it has created a Pages deployment. Only the
 * id is read; its other fields, and other entry types, are ignored.
 */
const PagesDeployDetailed = Schema.Struct({
  type: Schema.Literal('pages-deploy-detailed'),
  deployment_id: Schema.String
})

const decodeEntry = Schema.decodeUnknownOption(
  Schema.fromJsonString(PagesDeployDetailed)
)

/** The deployment id in wrangler's output file contents, if it wrote one. */
export const deploymentIdFrom = (output: string): string | undefined => {
  const deploymentId = pipe(
    output.split(/\r?\n/),
    Arr.findFirst(line => decodeEntry(line)),
    Option.map(entry => entry.deployment_id),
    Option.getOrUndefined
  )
  assert.ok(deploymentId === undefined || deploymentId.length > 0)
  return deploymentId
}

/** A private directory for wrangler's output file, removed afterwards. */
const outputDirectory = Effect.acquireRelease(
  Effect.tryPromise({
    try: () =>
      mkdtemp(
        path.join(process.env.RUNNER_TEMP || tmpdir(), 'wrangler-output-')
      ),
    catch: WranglerError.from
  }),
  directory =>
    Effect.tryPromise({
      try: () => rm(directory, {recursive: true, force: true}),
      catch: WranglerError.from
    }).pipe(
      // A leftover directory under `RUNNER_TEMP` is nothing a user can act
      // on, so the reason goes to the debug log rather than an annotation.
      Effect.catch(error =>
        Effect.sync(() => {
          debug(`${PREFIX} could not remove ${directory}: ${error.message}`)
        })
      )
    )
)

/** `ENOENT`: the file was never written. */
const isNoEntry = (cause: unknown): boolean =>
  Predicate.hasProperty(cause, 'code') && cause.code === 'ENOENT'

/** The `npx` arguments for `wrangler pages deploy`. */
const wranglerPagesDeployArguments = ({
  wranglerVersion,
  directory,
  projectName,
  branch,
  commitHash
}: {
  wranglerVersion: string
  directory: string
  projectName: string
  branch: string
  commitHash: string
}): ReadonlyArray<string> => [
  `wrangler@${wranglerVersion}`,
  'pages',
  'deploy',
  directory,
  '--project-name',
  projectName,
  '--branch',
  branch,
  '--commit-dirty=true',
  '--commit-hash',
  commitHash
]

/**
 * The child's environment. The credentials are scoped to the wrangler child
 * process rather than assigned onto the global `process.env`, which left the
 * Cloudflare API token in plaintext in this process for everything downstream
 * to read.
 */
const wranglerPagesDeployEnvironment = (
  apiToken: Redacted.Redacted<string>,
  accountId: string,
  outputFile: string
): NodeJS.ProcessEnv => ({
  ...process.env,
  [CLOUDFLARE_API_TOKEN]: secret(apiToken),
  [CLOUDFLARE_ACCOUNT_ID]: accountId,
  [WRANGLER_OUTPUT_FILE_PATH]: outputFile
})

/**
 * The deployment id from wrangler's output file, or `undefined` when wrangler
 * wrote none (a version too old to write the file).
 */
const wranglerPagesDeployOutput = Effect.fn('wranglerPagesDeployOutput')(
  function* (outputFile: string) {
    // A missing file is the one tolerated failure: an old wrangler writes
    // none. Anything else (unreadable, a directory) is reported.
    const output = yield* Effect.tryPromise({
      try: () => readFile(outputFile, 'utf8'),
      catch: WranglerError.from
    }).pipe(
      Effect.catch(error =>
        isNoEntry(error.cause) ? Effect.succeed('') : Effect.fail(error)
      )
    )

    const deploymentId = deploymentIdFrom(output)

    if (deploymentId === undefined) {
      debug(
        `${PREFIX} wrangler reported no deployment id; finding the deployment by commit hash`
      )
    }

    return deploymentId
  }
)

/**
 * Runs `wrangler pages deploy`, returning its stdout and the id of the
 * deployment it created. The id comes from wrangler's output file; it is
 * `undefined` when there is none — a `wrangler-version` too old to write it.
 */
export const wranglerPagesDeploy = Effect.fn('wranglerPagesDeploy')(function* ({
  wranglerVersion,
  apiToken,
  accountId,
  projectName,
  directory,
  branch,
  commitHash,
  workingDirectory
}: {
  wranglerVersion: string
  apiToken: Redacted.Redacted<string>
  accountId: string
  projectName: string
  directory: string
  branch: string
  commitHash: string
  workingDirectory: string
}) {
  assert.ok(wranglerVersion.length > 0)
  assert.ok(commitHash.length > 0)

  const outputFile = path.join(yield* outputDirectory, 'output.jsonl')
  // The child resolves the path from its own `cwd`, so it must be absolute.
  assert.ok(path.isAbsolute(outputFile))
  const wranglerTimeout = yield* WranglerTimeout

  /**
   * Tried to use wrangler.unstable_pages.deploy. But wrangler is 8mb+ and the bundler is unable to tree shake it.
   */
  const {stdout} = yield* Effect.tryPromise({
    try: signal =>
      execFileAsync(
        'npx',
        wranglerPagesDeployArguments({
          wranglerVersion,
          directory,
          projectName,
          branch,
          commitHash
        }),
        {
          env: wranglerPagesDeployEnvironment(apiToken, accountId, outputFile),
          cwd: workingDirectory,
          /** Interrupting the deploy (e.g. a failed check) kills wrangler. */
          signal
        }
      ),
    catch: WranglerError.from
  }).pipe(
    // The interrupt aborts `signal`, which kills the child.
    Effect.timeout(wranglerTimeout),
    Effect.catchTag(
      'TimeoutError',
      cause =>
        new WranglerError({
          message: `${PREFIX} timed out after ${Duration.format(wranglerTimeout)}`,
          cause
        })
    )
  )

  const deploymentId = yield* wranglerPagesDeployOutput(outputFile)

  return {stdout, deploymentId}
}, Effect.scoped)
