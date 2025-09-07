// @ts-check

import * as esbuild from 'esbuild'

/**
 * @type esbuild.SameShape<esbuild.BuildOptions, esbuild.BuildOptions>
 */
const config = {
  bundle: true,
  format: 'esm',
  keepNames: true,
  target: 'node24',
  platform: 'node',
  sourcemap: true,
  legalComments: 'external',
  logLevel: 'info',
  minify: false,
  minifySyntax: true,
  minifyWhitespace: true,
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
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  }
}

// deploy
await esbuild.build({
  ...config,
  entryPoints: ['src/deploy/index.ts'],
  outdir: './dist/deploy'
})

// delete
await esbuild.build({
  ...config,
  entryPoints: ['src/delete/index.ts'],
  outdir: './dist/delete'
})
