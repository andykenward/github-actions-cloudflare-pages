// @ts-check

import * as esbuild from 'esbuild'

/**
 * `@actions/core` imports `@actions/http-client` for `getIDToken` (OIDC), which
 * imports undici's `ProxyAgent`. undici is CommonJS with no `sideEffects` field,
 * so esbuild keeps all ~570 KB of it even though it is never called. Marking it
 * side-effect-free lets tree-shaking drop it; if anything does reference it,
 * esbuild still bundles it.
 * @type {esbuild.Plugin}
 */
const sideEffectFree = {
  name: 'side-effect-free',
  setup(build) {
    build.onResolve({filter: /^(undici|tunnel)$/}, async args => {
      // Skip our own resolve call below.
      if (args.pluginData) return
      const result = await build.resolve(args.path, {
        kind: args.kind,
        resolveDir: args.resolveDir,
        pluginData: true
      })
      return {...result, sideEffects: false}
    })
  }
}

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
  plugins: [sideEffectFree],
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
