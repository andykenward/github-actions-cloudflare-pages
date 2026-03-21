import type {UserConfig} from 'tsdown'

import {defineConfig} from 'tsdown'

const config = {
  unbundle: false,
  format: 'module',
  target: 'node24',
  platform: 'node',
  sourcemap: true,
  logLevel: 'info',
  minify: {
    mangle: false,
    compress: {
      keepNames: {
        function: true,
        class: true
      }
    },
    codegen: {
      removeWhitespace: true
    }
  },
  deps: {
    alwaysBundle: [
      '@actions/core',
      '@octokit-next/core',
      '@octokit/plugin-paginate-rest'
    ],
    neverBundle: ['wrangler'],
    skipNodeModulesBundle: false
  },
  treeshake: true,
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  fixedExtension: false
} satisfies UserConfig

export default defineConfig([
  {
    ...config,
    entry: './src/deploy/index.ts',
    outDir: './dist/deploy'
  },
  {
    ...config,
    entry: './src/delete/index.ts',
    outDir: './dist/delete'
  }
])
