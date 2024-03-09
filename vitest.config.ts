/// <reference types="vitest" />

// Configure Vitest (https://vitest.dev/config/)

import {resolve} from 'node:path'

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
    restoreMocks: false,
    reporters: 'default'
  },
  resolve: {
    alias: {
      /**
       * Used to resolve vi.mock() files
       * These have to match with tsconfig.json paths
       */
      '@/payloads/': `${resolve(process.cwd(), '__generated__/payloads')}/`,
      '@/responses/': `${resolve(process.cwd(), '__generated__/responses')}/`,
      '@/src/': `${resolve(process.cwd(), 'src')}/`,
      '@/tests/': `${resolve(process.cwd(), '__tests__')}/`,
      '@/types/': `${resolve(process.cwd(), '__generated__/types')}/`,
      '@/gql/': `${resolve(process.cwd(), '__generated__/gql')}/`
    }
  }
})
