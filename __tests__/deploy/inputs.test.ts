import {it} from '@effect/vitest'
import * as Effect from 'effect/Effect'
import {beforeEach, describe, expect, vi} from 'vitest'

import {errorMessage} from '@/common/errors.js'
import {DeployInputs} from '@/deploy/inputs.js'
import {
  INPUT_KEY_BRANCH,
  INPUT_KEY_WRANGLER_COMMENT_OUTPUT,
  INPUT_KEY_PR_NUMBER,
  INPUT_KEY_WORKING_DIRECTORY,
  INPUT_KEY_WRANGLER_VERSION
} from '@/input-keys'
import {stubInputEnv, stubRequiredInputEnv} from '@/tests/helpers/inputs.js'

import packageJson from '../../package.json' with {type: 'json'}

/** Builds the layer when run, so env stubbed beforehand is picked up. */
const deployInputs = Effect.gen(function* () {
  return yield* DeployInputs
}).pipe(Effect.provide(DeployInputs.layer))

const REQUIRED = {
  cloudflareAccountId: 'mock-cloudflare-account-id',
  cloudflareProjectName: 'mock-cloudflare-project-name',
  directory: 'mock-directory',
  gitHubEnvironment: 'mock-github-environment'
}

describe(DeployInputs, () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it.effect('returns the defaults for the optional inputs', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      stubRequiredInputEnv()

      expect(yield* deployInputs).toStrictEqual({
        ...REQUIRED,
        workingDirectory: '.',
        branch: undefined,
        pullRequestNumber: undefined,
        wranglerVersion: packageJson.devDependencies.wrangler,
        wranglerCommentOutput: true
      })
    })
  )

  it.effect('returns the optional inputs when provided', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      stubRequiredInputEnv()
      stubInputEnv(INPUT_KEY_WORKING_DIRECTORY, './src//common/../deploy')
      stubInputEnv(INPUT_KEY_BRANCH, 'pr-123')
      stubInputEnv(INPUT_KEY_PR_NUMBER, '123')
      stubInputEnv(INPUT_KEY_WRANGLER_VERSION, '4.0.0')
      stubInputEnv(INPUT_KEY_WRANGLER_COMMENT_OUTPUT, 'false')

      expect(yield* deployInputs).toStrictEqual({
        ...REQUIRED,
        workingDirectory: 'src/deploy',
        branch: 'pr-123',
        pullRequestNumber: 123,
        wranglerVersion: '4.0.0',
        wranglerCommentOutput: false
      })
    })
  )

  it.effect.each([
    {input: 'cloudflare-account-id'},
    {input: 'github-environment'}
  ])('fails naming the missing $input', ({input}) =>
    Effect.gen(function* () {
      expect.assertions(1)

      stubRequiredInputEnv()
      stubInputEnv(input, '')

      expect(errorMessage(yield* Effect.flip(deployInputs))).toBe(
        `Input required and not supplied: ${input}`
      )
    })
  )

  describe(INPUT_KEY_WORKING_DIRECTORY, () => {
    it.effect('reads a whitespace-only value as the current directory', () =>
      Effect.gen(function* () {
        expect.assertions(1)

        stubRequiredInputEnv()
        stubInputEnv(INPUT_KEY_WORKING_DIRECTORY, '   ')

        expect((yield* deployInputs).workingDirectory).toBe('.')
      })
    )

    it.effect('fails as an invalid input naming the directory as given', () =>
      Effect.gen(function* () {
        expect.assertions(1)

        stubRequiredInputEnv()
        stubInputEnv(INPUT_KEY_WORKING_DIRECTORY, './does-not-exist')

        // A `ConfigError`, not a defect thrown inside `Config.map`.
        expect(errorMessage(yield* Effect.flip(deployInputs))).toBe(
          "Input 'working-directory' is invalid: Directory not found: ./does-not-exist"
        )
      })
    )
  })

  describe(INPUT_KEY_PR_NUMBER, () => {
    it.effect.each([
      // `Number.parseInt` used to accept these as 12 and 1.
      {
        value: '12abc',
        expected: 'Expected a string representing a finite number'
      },
      {value: '1.5', expected: 'Expected an integer'},
      {value: '0', expected: 'Expected a value greater than 0'},
      {value: '-1', expected: 'Expected a value greater than 0'},
      // Larger than GraphQL's `Int`.
      {
        value: '2147483648',
        expected: 'Expected a value less than or equal to 2147483647'
      }
    ])('fails for $value', ({value, expected}) =>
      Effect.gen(function* () {
        expect.assertions(1)

        stubRequiredInputEnv()
        stubInputEnv(INPUT_KEY_PR_NUMBER, value)

        expect(errorMessage(yield* Effect.flip(deployInputs))).toBe(
          `Input 'pr-number' is invalid: ${expected}`
        )
      })
    )
  })

  describe(INPUT_KEY_WRANGLER_COMMENT_OUTPUT, () => {
    // The spellings `getBooleanInput` accepts, with the whitespace it trims.
    it.effect.each([
      {value: 'True', expected: true},
      {value: ' TRUE ', expected: true},
      {value: 'False', expected: false},
      {value: 'FALSE', expected: false}
    ])('reads $value as $expected', ({value, expected}) =>
      Effect.gen(function* () {
        expect.assertions(1)

        stubRequiredInputEnv()
        stubInputEnv(INPUT_KEY_WRANGLER_COMMENT_OUTPUT, value)

        expect((yield* deployInputs).wranglerCommentOutput).toBe(expected)
      })
    )

    it.effect.each([{value: 'yes'}, {value: '0'}, {value: '   '}])(
      'fails for $value',
      ({value}) =>
        Effect.gen(function* () {
          expect.assertions(1)

          stubRequiredInputEnv()
          stubInputEnv(INPUT_KEY_WRANGLER_COMMENT_OUTPUT, value)

          expect(errorMessage(yield* Effect.flip(deployInputs))).toBe(
            `Input 'wrangler-comment-output' is invalid: Expected "true" | "True" | "TRUE" | "false" | "False" | "FALSE"`
          )
        })
    )
  })
})
