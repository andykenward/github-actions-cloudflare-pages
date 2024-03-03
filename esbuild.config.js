// @ts-check

import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outdir: './dist',
  format: 'esm',
  keepNames: true,
  target: 'node20',
  platform: 'node',
  sourcemap: true,
  legalComments: 'external',
  logLevel: 'info',
  minify: false,
  minifySyntax: true,
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
    'process.env.npm_package_dependencies_wrangler': JSON.stringify(
      process.env.npm_package_dependencies_wrangler
    ),
    'process.env.NODE_ENV': JSON.stringify('production')
  }
})
