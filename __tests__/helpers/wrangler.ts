import {appendFile} from 'node:fs/promises'

import {WRANGLER_OUTPUT_FILE_PATH} from '@/common/cloudflare/deployment/wrangler.js'

/** The `execFileAsync` options a wrangler mock reads. */
export type ExecFileOptions = {env: NodeJS.ProcessEnv}

/**
 * An `execFileAsync` that behaves like wrangler: appends a
 * `pages-deploy-detailed` entry to `WRANGLER_OUTPUT_FILE_PATH`, then succeeds.
 * `onOutputFile` receives the file's path.
 */
export const wranglerReporting =
  (deploymentId: string, onOutputFile: (file: string) => void) =>
  async (
    _file: string,
    _args: ReadonlyArray<string>,
    {env}: ExecFileOptions
  ) => {
    const outputFile = env[WRANGLER_OUTPUT_FILE_PATH] ?? ''
    onOutputFile(outputFile)
    await appendFile(
      outputFile,
      `${JSON.stringify({type: 'pages-deploy-detailed', version: 1, deployment_id: deploymentId})}\n`
    )
    return {stdout: 'success', stderr: ''}
  }
