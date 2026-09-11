import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import {pathToFileURL} from 'node:url'

import packageJson from '../package.json' with {type: 'json'}

/**
 * Keeps versions pinned outside `package.json` in lockstep with it, so each is
 * bumped in one place:
 * - the default `wranglerVersion` fallback in `src/common/inputs.ts` follows
 *   `devDependencies.wrangler`;
 * - the devcontainer's pnpm (the node feature's `pnpmVersion` in
 *   `.devcontainer/devcontainer.json`) follows `packageManager`.
 */

const WRANGLER_FALLBACK =
  /(wranglerVersion: getInput\(INPUT_KEY_WRANGLER_VERSION\) \|\| ')([^']+)(')/
const DEVCONTAINER_PNPM = /("pnpmVersion":\s*")([^"]+)(")/

/**
 * Returns the pnpm version from a `packageManager` field such as
 * `pnpm@11.17.0` or `pnpm@11.17.0+sha512.…`.
 */
export function pnpmVersionFrom(packageManager: string): string {
  const version = /^pnpm@([^+]+)/.exec(packageManager)?.[1]
  assert.ok(
    version,
    `Expected packageManager "pnpm@<version>", got "${packageManager}"`
  )
  return version
}

function replaceVersion(
  content: string,
  pattern: RegExp,
  version: string,
  description: string
): string {
  assert.ok(pattern.test(content), `Unable to find ${description}`)
  return content.replace(
    pattern,
    (_match, before: string, _current: string, after: string) =>
      `${before}${version}${after}`
  )
}

/** Sets the `wranglerVersion` fallback in `src/common/inputs.ts`. */
export function syncWranglerFallback(content: string, version: string): string {
  return replaceVersion(
    content,
    WRANGLER_FALLBACK,
    version,
    'the wranglerVersion fallback in src/common/inputs.ts'
  )
}

/** Sets the node feature's `pnpmVersion` in `.devcontainer/devcontainer.json`. */
export function syncDevcontainerPnpm(content: string, version: string): string {
  return replaceVersion(
    content,
    DEVCONTAINER_PNPM,
    version,
    'pnpmVersion in .devcontainer/devcontainer.json'
  )
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const root = path.resolve(import.meta.dirname, '..')
  const wranglerVersion = packageJson.devDependencies.wrangler
  assert.ok(
    wranglerVersion,
    'Unable to find devDependencies.wrangler in package.json'
  )
  const pnpmVersion = pnpmVersionFrom(packageJson.packageManager)

  const targets = [
    {
      file: 'src/common/inputs.ts',
      sync: (content: string) => syncWranglerFallback(content, wranglerVersion)
    },
    {
      file: '.devcontainer/devcontainer.json',
      sync: (content: string) => syncDevcontainerPnpm(content, pnpmVersion)
    }
  ]

  for (const {file, sync} of targets) {
    const filePath = path.join(root, file)
    const content = fs.readFileSync(filePath, 'utf8')
    const updated = sync(content)
    if (updated !== content) {
      fs.writeFileSync(filePath, updated)
      process.stdout.write(`Updated ${file}\n`)
    }
  }
}
