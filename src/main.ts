/* eslint-disable no-console */

import {getProject} from './cloudflare/project/get-project.js'

export async function run() {
  /**
   * Get Cloudflare project
   */
  const {name, subdomain} = await getProject()

  return {name, subdomain}
}
