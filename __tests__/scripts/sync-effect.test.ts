import {execFileSync} from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {pathToFileURL} from 'node:url'

import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

import {
  readVendoredVersion,
  readWantedVersion,
  syncEffect
} from '../../bin/sync-effect.js'

const VERSION_OLD = '1.0.0'
const VERSION_NEW = '2.0.0'

const git = (cwd: string, ...arguments_: string[]): string =>
  execFileSync('git', arguments_, {cwd, encoding: 'utf8'}).trim()

const writeJson = (file: string, value: object) => {
  fs.mkdirSync(path.dirname(file), {recursive: true})
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
}

const writeText = (file: string, text: string) => {
  fs.mkdirSync(path.dirname(file), {recursive: true})
  fs.writeFileSync(file, text)
}

/** A stand-in for the Effect repository: two tagged releases. */
const createEffectRepo = (directory: string) => {
  git(directory, 'init', '--quiet', '--initial-branch=main')
  writeJson(path.join(directory, 'packages/effect/package.json'), {
    name: 'effect',
    version: VERSION_OLD
  })
  writeText(path.join(directory, 'old.ts'), 'export const old = true\n')
  git(directory, 'add', '--all')
  git(directory, 'commit', '--quiet', '-m', `effect@${VERSION_OLD}`)
  git(directory, 'tag', `effect@${VERSION_OLD}`)

  writeJson(path.join(directory, 'packages/effect/package.json'), {
    name: 'effect',
    version: VERSION_NEW
  })
  fs.rmSync(path.join(directory, 'old.ts'))
  writeText(path.join(directory, 'src/index.ts'), 'export const fresh = true\n')
  git(directory, 'add', '--all')
  git(directory, 'commit', '--quiet', '-m', `effect@${VERSION_NEW}`)
  git(directory, 'tag', `effect@${VERSION_NEW}`)
}

/** This repository, on a branch, with the old snapshot vendored. */
const createWorkRepo = (directory: string, wanted: string) => {
  git(directory, 'init', '--quiet', '--initial-branch=work')
  writeJson(path.join(directory, 'package.json'), {
    name: 'work',
    dependencies: {effect: wanted}
  })
  writeJson(path.join(directory, 'repos/effect/packages/effect/package.json'), {
    name: 'effect',
    version: VERSION_OLD
  })
  writeText(
    path.join(directory, 'repos/effect/old.ts'),
    'export const old = true\n'
  )
  git(directory, 'add', '--all')
  git(directory, 'commit', '--quiet', '-m', 'vendor effect')
}

describe(syncEffect, () => {
  let temporary: string
  let effectDirectory: string
  let root: string
  let effectRepo: string

  beforeEach(() => {
    // Isolate git from the developer's config (signing, hooks, identity).
    vi.stubEnv('GIT_CONFIG_GLOBAL', '/dev/null')
    vi.stubEnv('GIT_CONFIG_SYSTEM', '/dev/null')
    vi.stubEnv('GIT_CONFIG_COUNT', '3')
    vi.stubEnv('GIT_CONFIG_KEY_0', 'user.name')
    vi.stubEnv('GIT_CONFIG_VALUE_0', 'Test')
    vi.stubEnv('GIT_CONFIG_KEY_1', 'user.email')
    vi.stubEnv('GIT_CONFIG_VALUE_1', 'test@example.com')
    vi.stubEnv('GIT_CONFIG_KEY_2', 'commit.gpgsign')
    vi.stubEnv('GIT_CONFIG_VALUE_2', 'false')

    temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-effect-'))
    effectDirectory = path.join(temporary, 'effect')
    root = path.join(temporary, 'work')
    fs.mkdirSync(effectDirectory)
    fs.mkdirSync(root)
    createEffectRepo(effectDirectory)
    // `file://` so `--depth=1` applies; a plain path is a local clone, which
    // ignores depth with a warning.
    effectRepo = pathToFileURL(effectDirectory).href
  })

  afterEach(() => {
    fs.rmSync(temporary, {recursive: true, force: true})
  })

  test('replaces the snapshot with the tag and commits it', () => {
    createWorkRepo(root, VERSION_NEW)
    const before = git(root, 'rev-parse', 'HEAD')

    const outcome = syncEffect({root, effectRepo})

    expect(outcome).toStrictEqual({
      status: 'synced',
      tag: `effect@${VERSION_NEW}`,
      effectCommit: git(effectDirectory, 'rev-parse', `effect@${VERSION_NEW}`),
      commit: git(root, 'rev-parse', 'HEAD')
    })
    expect(git(root, 'rev-parse', 'HEAD')).not.toBe(before)
    expect(git(root, 'status', '--porcelain')).toBe('')
    expect(git(root, 'log', '-1', '--format=%s')).toBe(
      `chore: sync repos/effect to effect@${VERSION_NEW}`
    )
    expect(git(root, 'ls-files', 'repos/effect')).toBe(
      [
        'repos/effect/packages/effect/package.json',
        'repos/effect/src/index.ts'
      ].join('\n')
    )
    expect(readVendoredVersion(root)).toBe(VERSION_NEW)
  })

  test('does nothing when the snapshot is already at the wanted version', () => {
    createWorkRepo(root, VERSION_OLD)
    const before = git(root, 'rev-parse', 'HEAD')

    expect(syncEffect({root, effectRepo})).toStrictEqual({
      status: 'up-to-date',
      tag: `effect@${VERSION_OLD}`
    })
    expect(git(root, 'rev-parse', 'HEAD')).toBe(before)
  })

  test('refuses a dirty working tree', () => {
    createWorkRepo(root, VERSION_NEW)
    writeText(path.join(root, 'scratch.txt'), 'uncommitted\n')

    expect(() => syncEffect({root, effectRepo})).toThrow(
      /the working tree is not clean:\n\?\? scratch\.txt/
    )
    expect(git(root, 'ls-files', 'repos/effect/old.ts')).toBe(
      'repos/effect/old.ts'
    )
  })

  test('fails when the tag does not exist, leaving the tree untouched', () => {
    createWorkRepo(root, '3.0.0')
    const before = git(root, 'rev-parse', 'HEAD')

    expect(() => syncEffect({root, effectRepo})).toThrow(/git fetch/)
    expect(git(root, 'rev-parse', 'HEAD')).toBe(before)
    expect(git(root, 'status', '--porcelain')).toBe('')
  })

  test('rejects a dependencies.effect that is a range, not a version', () => {
    createWorkRepo(root, `^${VERSION_NEW}`)

    expect(() => readWantedVersion(root)).toThrow(
      'dependencies.effect must be exact: ^2.0.0'
    )
  })
})
