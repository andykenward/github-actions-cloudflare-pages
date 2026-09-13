import assert from 'node:assert/strict'
import {execFileSync} from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import {pathToFileURL} from 'node:url'

/**
 * Replaces the vendored `repos/effect` with the Effect source at the release
 * tag matching `dependencies.effect` in `package.json`, in one ordinary
 * commit made with your own git — so it is signed the way the rulesets
 * require. Run it on a branch with a clean tree, then push and open the PR.
 *
 * This is a local script rather than a workflow on purpose: a workflow can't
 * push a signed commit (an App has no signing key), and rebuilding the
 * thousands-of-files snapshot through GitHub's API took longer than a job
 * may run.
 */

const EFFECT_REPO_DEFAULT = 'https://github.com/Effect-TS/effect.git'
const SNAPSHOT_DIRECTORY = 'repos/effect'
const SHA_LENGTH = 40
const SHA_SHORT_LENGTH = 7
/**
 * A depth-1 fetch of the Effect repository is tens of MiB; ten minutes covers
 * a slow connection. Every other git command finishes in seconds.
 */
const GIT_FETCH_TIMEOUT_MS = 600_000
const GIT_TIMEOUT_MS = 60_000
/** 8 MiB bounds git's stdout (`status --porcelain` of a whole tree at most). */
const GIT_OUTPUT_SIZE_MAX = 8_388_608

export interface SyncOptions {
  /** The repository root, where `package.json` and `repos/effect` live. */
  readonly root: string
  /** The Effect git remote; tests point it at a local repository. */
  readonly effectRepo: string
}

export type SyncOutcome =
  | {readonly status: 'up-to-date'; readonly tag: string}
  | {
      readonly status: 'synced'
      readonly tag: string
      readonly effectCommit: string
      readonly commit: string
    }

interface GitOptions {
  readonly root: string
  readonly timeout?: number
}

const git = (options: GitOptions, ...arguments_: string[]): string => {
  assert.ok(arguments_.length > 0, 'git needs a subcommand')
  const output = execFileSync('git', arguments_, {
    cwd: options.root,
    encoding: 'utf8',
    maxBuffer: GIT_OUTPUT_SIZE_MAX,
    timeout: options.timeout ?? GIT_TIMEOUT_MS,
    stdio: ['ignore', 'pipe', 'inherit']
  })
  return output.trim()
}

interface PackageJson {
  readonly version?: string
  readonly dependencies?: {readonly effect?: string}
}

const readPackageJson = (file: string): PackageJson => {
  const parsed: unknown = JSON.parse(fs.readFileSync(file, 'utf8'))
  assert.ok(typeof parsed === 'object', `${file} is not an object`)
  assert.ok(parsed !== null, `${file} is null`)
  // Every field is optional, so any object is a `PackageJson`.
  return parsed
}

/** `dependencies.effect` of the root `package.json`. */
export function readWantedVersion(root: string): string {
  const file = path.join(root, 'package.json')
  const wanted = readPackageJson(file).dependencies?.effect ?? ''
  assert.ok(wanted.length > 0, `${file} has no dependencies.effect`)
  assert.match(wanted, /^\d/, `dependencies.effect must be exact: ${wanted}`)
  return wanted
}

/** `version` of the vendored `packages/effect/package.json`. */
export function readVendoredVersion(root: string): string {
  const file = path.join(
    root,
    SNAPSHOT_DIRECTORY,
    'packages',
    'effect',
    'package.json'
  )
  const vendored = readPackageJson(file).version ?? ''
  assert.ok(vendored.length > 0, `${file} has no version`)
  return vendored
}

/**
 * Fetches the tag, swaps the snapshot in the index and working tree, and
 * commits. Refuses a dirty tree, because the commit would sweep up whatever
 * else is staged.
 */
export function syncEffect(options: SyncOptions): SyncOutcome {
  const wanted = readWantedVersion(options.root)
  const vendored = readVendoredVersion(options.root)
  const tag = `effect@${wanted}`
  if (vendored === wanted) {
    return {status: 'up-to-date', tag}
  }
  const dirty = git(options, 'status', '--porcelain')
  assert.equal(dirty, '', `the working tree is not clean:\n${dirty}`)

  git(
    {root: options.root, timeout: GIT_FETCH_TIMEOUT_MS},
    'fetch',
    '--depth=1',
    '--no-tags',
    options.effectRepo,
    `refs/tags/${tag}`
  )
  const effectCommit = git(options, 'rev-parse', 'FETCH_HEAD^{commit}')
  assert.equal(effectCommit.length, SHA_LENGTH, `not a SHA: ${effectCommit}`)

  git(options, 'rm', '-rq', '--ignore-unmatch', SNAPSHOT_DIRECTORY)
  git(
    options,
    'read-tree',
    `--prefix=${SNAPSHOT_DIRECTORY}/`,
    '-u',
    'FETCH_HEAD'
  )
  git(
    options,
    'commit',
    '--quiet',
    '-m',
    `chore: sync ${SNAPSHOT_DIRECTORY} to ${tag}`,
    '-m',
    `Effect ${tag} is commit ${effectCommit}.`
  )
  const commit = git(options, 'rev-parse', 'HEAD')
  assert.equal(commit.length, SHA_LENGTH, `not a SHA: ${commit}`)
  assert.equal(
    readVendoredVersion(options.root),
    wanted,
    'the snapshot is not at the wanted version after the sync'
  )
  return {status: 'synced', tag, effectCommit, commit}
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const root = path.resolve(import.meta.dirname, '..')
  const branch = git({root}, 'branch', '--show-current')
  assert.notEqual(branch, 'main', 'check out a branch first; main is protected')

  const outcome = syncEffect({
    root,
    effectRepo: process.env['EFFECT_REPO'] || EFFECT_REPO_DEFAULT
  })
  if (outcome.status === 'up-to-date') {
    process.stdout.write(`${SNAPSHOT_DIRECTORY} is already at ${outcome.tag}\n`)
  } else {
    process.stdout.write(
      `Committed ${outcome.commit.slice(0, SHA_SHORT_LENGTH)}: ${SNAPSHOT_DIRECTORY} at ${outcome.tag} (Effect ${outcome.effectCommit.slice(0, SHA_SHORT_LENGTH)})\n` +
        `Push ${branch} and open a pull request.\n`
    )
  }
}
