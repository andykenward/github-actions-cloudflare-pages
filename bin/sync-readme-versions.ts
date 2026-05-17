import assert from 'node:assert'
import {execSync} from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import {pathToFileURL} from 'node:url'

import packageJson from '../package.json' with {type: 'json'}

/**
 * Replaces all `andykenward/github-actions-cloudflare-pages` action version
 * references in a file's content with the given SHA and version.
 *
 * Handles both tag-only (`@v3.0.0`) and SHA+tag (`@abc123 #v3.0.0`) forms.
 * The /delete sub-action pattern is replaced first to prevent partial matching
 * by the main action pattern.
 */
export function replaceVersionReferences(
  content: string,
  sha: string,
  version: string
): string {
  return content
    .replaceAll(
      /(andykenward\/github-actions-cloudflare-pages\/delete)@\S+(?:\s+#v[\d.]+)?/g,
      `$1@${sha} #v${version}`
    )
    .replaceAll(
      /(andykenward\/github-actions-cloudflare-pages)@\S+(?:\s+#v[\d.]+)?/g,
      `$1@${sha} #v${version}`
    )
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const {version} = packageJson
  assert.ok(version, 'Unable to find version in package.json')

  const sha = execSync('git rev-parse HEAD').toString().trim()
  assert.ok(sha.length === 40, `Expected full 40-char SHA, got: ${sha}`)

  const root = path.resolve(import.meta.dirname, '..')

  const files = [
    path.join(root, 'README.md'),
    path.join(root, 'delete', 'README.md'),
    path.join(root, '.github', 'workflow-templates', 'deploy.yml'),
    path.join(root, '.github', 'workflow-templates', 'delete.yml')
  ]

  for (const filePath of files) {
    const original = fs.readFileSync(filePath, 'utf8')
    const updated = replaceVersionReferences(original, sha, version)

    if (updated !== original) {
      fs.writeFileSync(filePath, updated)
      process.stdout.write(
        `Updated ${path.relative(root, filePath)}: ${version} @ ${sha.slice(0, 7)}\n`
      )
    }
  }
}
