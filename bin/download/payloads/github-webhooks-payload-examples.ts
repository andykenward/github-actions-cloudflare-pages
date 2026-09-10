import 'dotenv/config'
import {existsSync, readFileSync} from 'node:fs'
import {mkdir, writeFile} from 'node:fs/promises'

import type {
  ListPayloadExampleFilesQuery,
  ListPayloadExampleFilesQueryVariables
} from '../../../__generated__/gql/graphql.js'

/**
 * Read at runtime: this script runs with plain `node`, which cannot import the
 * generated `…Document` constants (see "`node` vs `tsx`" in CLAUDE.md). The
 * types above are type-only imports, which node strips.
 */
const LIST_PAYLOAD_EXAMPLE_FILES = readFileSync(
  new URL('github-webhooks-payload-examples.graphql', import.meta.url),
  'utf8'
)

const OWNER = 'octokit'
const REPO = 'webhooks'
const BRANCH = 'main:'

const API_URL = 'https://api.github.com/graphql'
const TOKEN = process.env['GITHUB_TOKEN']

if (!TOKEN) throw new Error('GITHUB_TOKEN environment variable not set')

const request = async <T, V>(query: string, variables: V): Promise<T> => {
  return fetch(API_URL, {
    method: 'POST',
    headers: {
      authorization: `bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({query, variables})
  })
    .then(res => res.json() as Promise<{data: T; errors: unknown}>)
    .then(res => {
      if (res.errors) {
        throw new Error(JSON.stringify(res.errors))
      }
      return res.data
    })
}

const getWebhookExamples = async (folder: string) => {
  const PATH_READ = `${BRANCH}payload-examples/api.github.com/${folder}`

  /**
   * Get all files in a directory and their blob contents
   */
  const response = await request<
    ListPayloadExampleFilesQuery,
    ListPayloadExampleFilesQueryVariables
  >(LIST_PAYLOAD_EXAMPLE_FILES, {
    owner: OWNER,
    repo: REPO,
    path: PATH_READ
  })

  if (response.repository?.object?.__typename === 'Tree') {
    const data = response.repository?.object?.entries
    if (Array.isArray(data)) {
      /**
       * Filter out all non-json files
       */
      return data.filter(
        file =>
          file.type === 'blob' &&
          file.language?.name === 'JSON' &&
          file.name.endsWith('.json') &&
          file.object?.__typename === 'Blob' &&
          file.object?.text
      )
    }
  }
  throw new Error('No data returned or not a tree of entries')
}
/**
 * Script to download GitHub webhook examples JSON files
 * https://github.com/octokit/webhooks/blob/main/payload-examples/README.md
 * Make sure you have a GITHUB_TOKEN environment variable set.
 * Otherwise you will hit the GitHub API rate limit very quickly.
 */
const run = async (folder: string) => {
  await getWebhookExamples(folder).then(async json => {
    if (!json) return
    for (const data of json) {
      if (data?.object?.__typename !== 'Blob' || !data.object.text) return

      const PATH_WRITE = `__generated__/payloads/api.github.com/${folder}`

      if (!existsSync(PATH_WRITE)) {
        await mkdir(PATH_WRITE, {recursive: true})
      }

      const filename = `${PATH_WRITE}/${data.name}`
      // oxlint-disable-next-line no-console
      console.log(filename)
      /**
       * Save each file to the file system
       */
      await writeFile(filename, Buffer.from(data.object.text, 'utf8'))
    }
  })
}

void run('pull_request')
void run('push')
void run('workflow_run')
void run('workflow_dispatch')
