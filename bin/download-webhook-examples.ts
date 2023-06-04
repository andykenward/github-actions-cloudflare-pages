#!/usr/bin/env ts-node-transpile-only

/**
 * Script to download GitHub webhook examples JSON files
 * https://github.com/octokit/webhooks/blob/main/payload-examples/README.md
 * Make sure you have a GITHUB_TOKEN environment variable set.
 * Otherwise you will hit the GitHub API rate limit very quickly.
 */
import 'dotenv/config.js'

import {writeFile} from 'node:fs/promises'

import {Octokit} from '@octokit/core'

const octokit = new Octokit({
  auth: process.env['GITHUB_TOKEN']
})

const PATH_PULL_REQUEST = `payload-examples/api.github.com/pull_request`

const getWebhookExamples = async () => {
  /**
   * Get all files in a directory
   */
  const {data} = await octokit.request(
    'GET /repos/{owner}/{repo}/contents/{path}',
    {
      owner: 'octokit',
      repo: 'webhooks',
      path: PATH_PULL_REQUEST
    }
  )

  if (Array.isArray(data)) {
    /**
     * Filter out all non-json files
     */
    const jsonFiles = data.filter(
      file => file.type === 'file' && file.name.endsWith('.json')
    )

    /**
     * Get each file for the contents data as that is only returned on a file
     * request and not a directory request
     */
    const json = await Promise.all(
      jsonFiles.map(async file => {
        const {data} = await octokit.request(
          'GET /repos/{owner}/{repo}/contents/{path}',
          {
            owner: 'octokit',
            repo: 'webhooks',
            path: file.path
          }
        )
        return data
      })
    )

    return json
  }

  return
}

const run = async () => {
  await getWebhookExamples().then(async json => {
    if (!json) return
    for (const data of json) {
      if (Array.isArray(data) || data.type !== 'file') return

      const filename = `${PATH_PULL_REQUEST}/${data.name}`
      // eslint-disable-next-line no-console
      console.log(filename)
      /**
       * Save each file to the file system
       */
      await writeFile(filename, Buffer.from(data.content, 'base64'))
    }
  })
}

void run()
