/// <reference types="vitest" />

// Configure Vitest (https://vitest.dev/config/)

import path from 'node:path'

import {defaultExclude, defineConfig} from 'vitest/config'

export default defineConfig({
  cacheDir: '.cache/.vitest',
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
      '@/common/': `${path.resolve(process.cwd(), 'src/common')}/`,
      '@/delete/': `${path.resolve(process.cwd(), 'src/delete')}/`,
      '@/deploy/': `${path.resolve(process.cwd(), 'src/deploy')}/`,
      '@/fixtures/': `${path.resolve(process.cwd(), '__fixtures__')}/`,
      '@/gql/': `${path.resolve(process.cwd(), '__generated__/gql')}/`,
      '@/input-keys': `${path.resolve(process.cwd(), 'input-keys.ts')}`,
      '@/payloads/': `${path.resolve(process.cwd(), '__generated__/payloads')}/`,
      '@/responses/': `${path.resolve(process.cwd(), '__generated__/responses')}/`,
      '@/tests/': `${path.resolve(process.cwd(), '__tests__')}/`,
      '@/types/': `${path.resolve(process.cwd(), '__generated__/types')}/`
    }
  }
})
