import assert from 'node:assert'

import type {FetchResult, PagesDeployment} from '@/common/cloudflare/types.js'

import 'dotenv/config'

const API_ENDPOINT = 'https://api.cloudflare.com'
const CLOUDFLARE_ACCOUNT_ID = process.env['CLOUDFLARE_ACCOUNT_ID']
const CLOUDFLARE_PROJECT_NAME = process.env['CLOUDFLARE_PROJECT_NAME']
const CLOUDFLARE_API_TOKEN = process.env['CLOUDFLARE_API_TOKEN']

/**
 * Each pass lists one page and deletes what it can, so a project with more
 * pages than this needs another run.
 */
const PASS_COUNT_MAX = 100

if (!CLOUDFLARE_API_TOKEN) {
  throw new Error('CLOUDFLARE_API_TOKEN environment variable not set')
}

const getUrl = () => {
  const path = `deployments`

  const input: string = [
    `/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/${CLOUDFLARE_PROJECT_NAME}`,
    path
  ]
    .filter(Boolean)
    .join('/')

  return new URL(input, API_ENDPOINT).toString()
}

const getHeaders = (): RequestInit['headers'] => ({
  authorization: `bearer ${CLOUDFLARE_API_TOKEN}`,
  'Content-Type': 'application/json'
})

const run = async () => {
  const URL = getUrl()

  for (let pass = 0; pass < PASS_COUNT_MAX; pass++) {
    const result = await fetch(URL, {
      method: 'GET',
      headers: getHeaders()
    }).then(
      response =>
        response.json() as unknown as FetchResult<Array<PagesDeployment>>
    )

    if (!result.success) {
      throw new Error(
        `Listing deployments failed: ${JSON.stringify(result.errors)}`
      )
    }

    const previewDeployments = result.result?.filter(
      item => item.environment === 'preview'
    )

    if (!previewDeployments?.length) {
      // oxlint-disable-next-line no-console
      console.log('---> No more deployments to delete')
      return
    }

    let deletedCount = 0

    for (const item of previewDeployments) {
      const result = await fetch(`${URL}/${item.id}?force=true`, {
        method: 'DELETE',
        headers: getHeaders()
      }).then(response => response.json() as unknown as FetchResult<null>)

      if (result.success) {
        deletedCount++
        // oxlint-disable-next-line no-console
        console.log(`---> Deleted deployment: ${item.id}`)
      } else {
        // oxlint-disable-next-line no-console, unicorn/no-null
        console.dir(result, {depth: null})
      }
    }

    // Each pass re-lists the first page, so a pass that deletes nothing would
    // otherwise re-fetch the same undeletable deployments forever.
    if (deletedCount === 0) {
      // oxlint-disable-next-line no-console
      console.log('---> No deployments could be deleted, stopping')
      return
    }
  }

  assert.fail(`Still deleting after ${PASS_COUNT_MAX} passes; run again`)
}

void run()
