/// <reference types="vitest" />

// Configure Vitest (https://vitest.dev/config/)

import {resolve} from 'node:path'

import {defaultExclude, defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: ['vitest.setup.ts'],
    exclude: [
      ...defaultExclude,
      '**/.{devcontainer,github,vscode}/**',
      '**/{prettier}.config.*',
      '**/{vitest}.setup.*'
    ],
    alias: {
      '@/': `${resolve(process.cwd(), 'src')}/`
    }
  }
})
