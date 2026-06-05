import Cloudflare from 'cloudflare'

import {useCommonInputs} from '@/common/inputs.js'

export const getCloudflareClient = (): Cloudflare => {
  const {cloudflareApiToken} = useCommonInputs()
  return new Cloudflare({apiToken: cloudflareApiToken})
}
