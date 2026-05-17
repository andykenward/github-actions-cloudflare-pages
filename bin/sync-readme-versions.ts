import assert from 'node:assert'
import {execSync} from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import {pathToFileURL} from 'node:url'

import type {TypedDocumentString} from '@/gql/graphql.js'

import {graphql} from '@/gql/gql.js'

import packageJson from '../package.json' with {type: 'json'}

const GITHUB_GRAPHQL_API = 'https://api.github.com/graphql'

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

export const QueryLatestRelease = graphql(/* GraphQL */ `
  query LatestRelease($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      latestRelease {
        tagName
        tagCommit {
          oid
        }
      }
    }
  }
`)

const request = async <TResult, TVariables>(
  query: TypedDocumentString<TResult, TVariables>,
  variables: TVariables
): Promise<TResult> => {
  const token = process.env['GITHUB_TOKEN']
  const headers: Record<string, string> = {'Content-Type': 'application/json'}
  if (token) headers['authorization'] = `bearer ${token}`

  const res = await fetch(GITHUB_GRAPHQL_API, {
    method: 'POST',
    headers,
    body: JSON.stringify({query: query.toString(), variables})
  })
  assert.ok(res.ok, `GitHub API request failed: ${res.status}`)
  const {data, errors} = (await res.json()) as {data: TResult; errors?: unknown}
  assert.ok(!errors, `GitHub API errors: ${JSON.stringify(errors)}`)
  return data
}

export async function getLatestRelease(): Promise<{
  sha: string
  version: string
}> {
  const data = await request(QueryLatestRelease, {
    owner: 'andykenward',
    repo: 'github-actions-cloudflare-pages'
  })

  assert.ok(data.repository, 'No repository in response')
  assert.ok(data.repository.latestRelease, 'No latestRelease in response')
  const {tagName, tagCommit} = data.repository.latestRelease
  assert.ok(tagName, 'No tagName in latest release')
  assert.ok(tagCommit, 'No tagCommit in latest release')
  assert.ok(
    tagCommit.oid.length === 40,
    `Expected full 40-char SHA, got: ${tagCommit.oid}`
  )

  return {sha: tagCommit.oid, version: tagName.replace(/^v/, '')}
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  let sha: string
  let version: string

  if (process.env['GITHUB_ACTIONS'] === 'true') {
    // In CI, the workflow is triggered by a tag push — use local git and
    // package.json so the SHA matches the commit that was just tagged.
    version = packageJson.version
    assert.ok(version, 'Unable to find version in package.json')
    sha = execSync('git rev-parse HEAD').toString().trim()
    assert.ok(sha.length === 40, `Expected full 40-char SHA, got: ${sha}`)
  } else {
    // Manual run — fetch the latest published release from GitHub.
    ;({sha, version} = await getLatestRelease())
  }

  process.stdout.write(`Syncing: ${version} @ ${sha.slice(0, 7)}\n`)

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
      process.stdout.write(`  Updated ${path.relative(root, filePath)}\n`)
    }
  }
}
