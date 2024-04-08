/// <reference types="vitest" />

// Configure Vitest (https://vitest.dev/config/)

import path from 'node:path'

import {defaultExclude, defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['vitest.setup.ts'],
    exclude: [
      ...defaultExclude,
      '**/.{devcontainer,github,vscode}/**',
      '**/{bin,dist,example,payload-example}/**',
      '**/*.config.*',
      '**/{vitest}.setup.*',
      '__tests__/helpers/**'
    ],
    clearMocks: true,
    restoreMocks: false
  },
  resolve: {
    alias: {
      /**
       * Used to resolve vi.mock() files
       * These have to match with tsconfig.json paths
       */
      '@/payloads/': `${path.resolve(process.cwd(), '__generated__/payloads')}/`,
      '@/responses/': `${path.resolve(process.cwd(), '__generated__/responses')}/`,
      '@/src/': `${path.resolve(process.cwd(), 'src')}/`,
      '@/tests/': `${path.resolve(process.cwd(), '__tests__')}/`,
      '@/types/': `${path.resolve(process.cwd(), '__generated__/types')}/`,
      '@/gql/': `${path.resolve(process.cwd(), '__generated__/gql')}/`
    }
  }
})
