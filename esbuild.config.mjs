// @ts-check

import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outdir: './dist',
  format: 'esm',
  /**
   * This has to be node 16 instead of node 18 because GitHub Actions doesn't support node 18 yet.
   */
  target: 'node16.20.0',
  platform: 'node',
  sourcemap: true,
  legalComments: 'external',
  logLevel: 'info',
  minify: true,
  external: ['wrangler'],
  treeShaking: true,
  banner: {
    /**
     * Adding banner js import fixes the error of
     * "Error: Dynamic require of "os" is not supported"
     * When running the build output in node.
     * Related issues:
     * - https://github.com/evanw/esbuild/issues/1921
     * - https://github.com/evanw/esbuild/issues/1944
     *
     * Taken from :
     * https://github.com/serverless-stack/sst/blob/1aaf1bc06b94c2036f147cb24b25a037c5a95b0a/packages/sst/build.mjs#L26-L29
     */
    js: [
      `import { createRequire as topLevelCreateRequire } from 'module';`,
      `const require = topLevelCreateRequire(import.meta.url);`
    ].join('')
  }
})
