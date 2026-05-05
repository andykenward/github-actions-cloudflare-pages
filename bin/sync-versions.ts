import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'

import packageJson from '../package.json' with {type: 'json'}

/**
 * Synchronizes the default `wranglerVersion` fallback in `src/common/inputs.ts`
 * with `devDependencies.wrangler` from `package.json`.
 */

const wranglerVersion = packageJson.devDependencies.wrangler

assert.ok(
  wranglerVersion,
  'Unable to find devDependencies.wrangler in package.json'
)

const inputsPath = path.resolve(import.meta.dirname, '../src/common/inputs.ts')
const content = fs.readFileSync(inputsPath, 'utf8')
const wranglerVersionPattern =
  /wranglerVersion: getInput\(INPUT_KEY_WRANGLER_VERSION\) \|\| '([^']+)'/

const currentWranglerVersion = content.match(wranglerVersionPattern)?.[1]

assert.ok(
  currentWranglerVersion,
  'Unable to find wranglerVersion fallback in src/common/inputs.ts'
)

if (currentWranglerVersion !== wranglerVersion) {
  const updated = content.replace(
    wranglerVersionPattern,
    `wranglerVersion: getInput(INPUT_KEY_WRANGLER_VERSION) || '${wranglerVersion}'`
  )

  fs.writeFileSync(inputsPath, updated)
  process.stdout.write(
    `Updated wrangler version fallback: ${currentWranglerVersion} -> ${wranglerVersion}\n`
  )
}
