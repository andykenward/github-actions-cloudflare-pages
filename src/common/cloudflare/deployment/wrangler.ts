import type * as Redacted from 'effect/Redacted'

import {mkdtemp, readFile, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'

import {debug} from '@actions/core'
import * as Arr from 'effect/Array'
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

const ERROR_KEY = `Create Deployment:`

// oxlint-disable-next-line unicorn/throw-new-error
class WranglerError extends Schema.TaggedError<WranglerError>()(
  'WranglerError',
  {
    message: Schema.String,
    cause: Schema.Defect()
  }
) {
  /**
   * A rejected `execFile` is an `Error` whose message already includes
   * wrangler's stderr. Anything else is reported by its `stderr`, if it has
   * one.
   */
  static readonly from = (cause: unknown): WranglerError => {
    if (cause instanceof Error) {
      return new WranglerError({message: errorMessage(cause), cause})
    }
    if (
      Predicate.hasProperty(cause, 'stderr') &&
      Predicate.isString(cause.stderr)
    ) {
      return new WranglerError({message: cause.stderr, cause})
    }
    return new WranglerError({message: `${ERROR_KEY} unknown error`, cause})
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
export const deploymentIdFrom = (output: string): string | undefined =>
  pipe(
    output.split('\n'),
    Arr.findFirst(line => decodeEntry(line)),
    Option.map(entry => entry.deployment_id),
    Option.getOrUndefined
  )

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
    Effect.tryPromise(() => rm(directory, {recursive: true, force: true})).pipe(
      Effect.ignore
    )
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
  const outputFile = path.join(yield* outputDirectory, 'output.jsonl')

  /**
   * Tried to use wrangler.unstable_pages.deploy. But wrangler is 8mb+ and the bundler is unable to tree shake it.
   */
  const {stdout} = yield* Effect.tryPromise({
    try: () =>
      execFileAsync(
        'npx',
        [
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
        ],
        {
          /**
           * The credentials are scoped to the wrangler child process rather
           * than assigned onto the global `process.env`, which left the
           * Cloudflare API token in plaintext in this process for
           * everything downstream to read.
           */
          env: {
            ...process.env,
            [CLOUDFLARE_API_TOKEN]: secret(apiToken),
            [CLOUDFLARE_ACCOUNT_ID]: accountId,
            [WRANGLER_OUTPUT_FILE_PATH]: outputFile
          },
          cwd: workingDirectory
        }
      ),
    catch: WranglerError.from
  })

  const output = yield* Effect.tryPromise(() =>
    readFile(outputFile, 'utf8')
  ).pipe(Effect.orElseSucceed(() => ''))

  const deploymentId = deploymentIdFrom(output)

  if (deploymentId === undefined) {
    debug(
      `${ERROR_KEY} wrangler reported no deployment id; finding the deployment by commit hash`
    )
  }

  return {stdout, deploymentId}
}, Effect.scoped)
