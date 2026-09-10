import type {FetchResult, PagesDeployment} from '@/common/cloudflare/types.js'
import 'dotenv/config'

const API_ENDPOINT = 'https://api.cloudflare.com'
const CLOUDFLARE_ACCOUNT_ID = process.env['CLOUDFLARE_ACCOUNT_ID']
const CLOUDFLARE_PROJECT_NAME = process.env['CLOUDFLARE_PROJECT_NAME']
const CLOUDFLARE_API_TOKEN = process.env['CLOUDFLARE_API_TOKEN']

if (!CLOUDFLARE_API_TOKEN)
  throw new Error('CLOUDFLARE_API_TOKEN environment variable not set')

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

  let deleting = true

  while (deleting) {
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
      deleting = false
      // oxlint-disable-next-line no-console
      console.log('---> No more deployments to delete')
      break
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
      deleting = false
      // oxlint-disable-next-line no-console
      console.log('---> No deployments could be deleted, stopping')
    }
  }
}

void run()
