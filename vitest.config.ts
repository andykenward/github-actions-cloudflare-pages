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
    restoreMocks: false
  },
  resolve: {
    alias: {
      /**
       * Used to resolve vi.mock() files
       * These have to match with tsconfig.json paths
       */
      '@/common/': `${resolve(process.cwd(), 'src/common')}/`,
      '@/delete/': `${resolve(process.cwd(), 'src/delete')}/`,
      '@/deploy/': `${resolve(process.cwd(), 'src/deploy')}/`,
      '@/gql/': `${resolve(process.cwd(), '__generated__/gql')}/`,
      '@/input-keys': `${resolve(process.cwd(), 'input-keys.ts')}`,
      '@/payloads/': `${resolve(process.cwd(), '__generated__/payloads')}/`,
      '@/responses/': `${resolve(process.cwd(), '__generated__/responses')}/`,
      '@/tests/': `${resolve(process.cwd(), '__tests__')}/`,
      '@/types/': `${resolve(process.cwd(), '__generated__/types')}/`
    }
  }
})
