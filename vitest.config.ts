/// <reference types="vitest" />

// Configure Vitest (https://vitest.dev/config/)

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
    clearMocks: true
  }
})
