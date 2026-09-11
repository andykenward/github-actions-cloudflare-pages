import fs from 'node:fs'
import path from 'node:path'

import {describe, expect, test} from 'vitest'

import {
  pnpmVersionFrom,
  syncDevcontainerPnpm,
  syncWranglerFallback
} from '../../bin/sync-versions.js'
import packageJson from '../../package.json' with {type: 'json'}

const ROOT = path.resolve(import.meta.dirname, '../..')
const readRepoFile = (file: string) =>
  fs.readFileSync(path.join(ROOT, file), 'utf8')

const DEVCONTAINER = `{
  "features": {
    "ghcr.io/devcontainers/features/node:2.1.0": {
      "version": "24",
      "pnpmVersion": "11.17.0"
    }
  }
}`

const INPUTS = `export const useCommonInputs = () => ({
  wranglerVersion: getInput(INPUT_KEY_WRANGLER_VERSION) || '4.100.0'
})`

describe(pnpmVersionFrom, () => {
  test('returns the pnpm version', () => {
    expect(pnpmVersionFrom('pnpm@11.17.0')).toBe('11.17.0')
  })

  test('drops an integrity hash', () => {
    expect(pnpmVersionFrom('pnpm@10.11.0+sha512.abc123')).toBe('10.11.0')
  })

  test('throws for another package manager', () => {
    expect(() => pnpmVersionFrom('yarn@4.1.0')).toThrow(
      'Expected packageManager "pnpm@<version>", got "yarn@4.1.0"'
    )
  })
})

describe(syncDevcontainerPnpm, () => {
  test('replaces pnpmVersion', () => {
    expect(syncDevcontainerPnpm(DEVCONTAINER, '12.3.4')).toBe(
      DEVCONTAINER.replace(
        '"pnpmVersion": "11.17.0"',
        '"pnpmVersion": "12.3.4"'
      )
    )
  })

  test('leaves a matching version unchanged', () => {
    expect(syncDevcontainerPnpm(DEVCONTAINER, '11.17.0')).toBe(DEVCONTAINER)
  })

  test('throws when pnpmVersion is missing', () => {
    expect(() => syncDevcontainerPnpm('{}', '12.3.4')).toThrow(
      'Unable to find pnpmVersion in .devcontainer/devcontainer.json'
    )
  })
})

describe(syncWranglerFallback, () => {
  test('replaces the fallback version', () => {
    expect(syncWranglerFallback(INPUTS, '4.113.0')).toBe(
      INPUTS.replace("|| '4.100.0'", "|| '4.113.0'")
    )
  })

  test('throws when the fallback is missing', () => {
    expect(() => syncWranglerFallback('', '4.113.0')).toThrow(
      'Unable to find the wranglerVersion fallback in src/common/inputs.ts'
    )
  })
})

describe('repository versions', () => {
  test('devcontainer pnpm matches packageManager', () => {
    const content = readRepoFile('.devcontainer/devcontainer.json')

    expect(
      syncDevcontainerPnpm(
        content,
        pnpmVersionFrom(packageJson.packageManager)
      ),
      'run `node bin/sync-versions.ts`'
    ).toBe(content)
  })

  test('wrangler fallback matches devDependencies.wrangler', () => {
    const content = readRepoFile('src/common/inputs.ts')

    expect(
      syncWranglerFallback(content, packageJson.devDependencies.wrangler),
      'run `node bin/sync-versions.ts`'
    ).toBe(content)
  })
})
