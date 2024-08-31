// @ts-nocheck

import eslint from '@eslint/js'
import vitest from '@vitest/eslint-plugin'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      '.vscode',
      '.devcontainer',
      'dist',
      'node_modules',
      'eslint.config.js',
      'example',
      'payload-examples',
      '__generated__'
    ]
  },
  {
    files: ['**/*.{js,mjs,cjs,ts}']
  },
  {
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname
      }
    }
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginUnicorn.configs['flat/all'],
  {
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      'unicorn/prefer-top-level-await': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'no-console': 'error'
    }
  },
  eslintConfigPrettier,
  {
    files: ['**/*.test.ts'],
    plugins: {
      vitest,
      eslintPluginUnicorn
    },
    settings: {
      vitest: {
        typecheck: true
      }
    },
    languageOptions: {
      globals: {
        ...vitest.environments.env.globals
      }
    },
    rules: {
      ...vitest.configs.all.rules,
      'vitest/consistent-test-it': ['error', {fn: 'test'}],
      'vitest/no-hooks': [
        'error',
        {allow: ['afterEach', 'beforeEach', 'afterAll']}
      ],
      'vitest/max-expects': 'off',
      'vitest/no-mocks-import': 'off',
      'unicorn/numeric-separators-style': 'off',
      'unicorn/no-null': 'off',
      '@typescript-eslint/unbound-method': 'off'
    }
  },
  {
    files: ['__fixtures__/**'],
    rules: {
      'unicorn/no-null': 'off',
      'unicorn/numeric-separators-style': 'off'
    }
  }
)
