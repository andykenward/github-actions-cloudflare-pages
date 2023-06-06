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
      '**/{bin,dist,example,payload-example}/**',
      '**/*.config.*',
      '**/{vitest}.setup.*'
    ],
    clearMocks: true
  },
  resolve: {
    alias: {
      /**
       * Used to resolve vi.mock() files
       * These have to match with tsconfig.json paths
       */
      '@/src/': `${resolve(process.cwd(), 'src')}/`,
      '@/tests/': `${resolve(process.cwd(), '__tests__')}/`,
      '@/types/': `${resolve(process.cwd(), '__generated__')}/`
    }
  }
})
