import {info} from '@actions/core'
import {describe, expect, test, vi} from 'vitest'

import {checkWorkingDirectory, logVerbatim} from '@/common/utils.js'

vi.mock(import('@actions/core'))

const messages = (): Array<string> =>
  vi.mocked(info).mock.calls.map(([message]) => message)

describe(logVerbatim, () => {
  test('wraps the output in stop-commands with a matching random token', () => {
    expect.assertions(2)

    logVerbatim('::error::injected')

    const token = messages()[0]?.replace('::stop-commands::', '')

    expect(token).toMatch(
      /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/
    )
    expect(messages()).toStrictEqual([
      `::stop-commands::${token}`,
      '::error::injected',
      `::${token}::`
    ])
  })

  test('uses a new token each call', () => {
    expect.assertions(1)

    logVerbatim('a')
    logVerbatim('b')

    expect(messages()[0]).not.toBe(messages()[3])
  })
})

describe(checkWorkingDirectory, () => {
  test('defaults to the current directory', () => {
    expect.assertions(1)

    expect(checkWorkingDirectory()).toBe('.')
  })

  test('returns an existing directory normalised', () => {
    expect.assertions(1)

    expect(checkWorkingDirectory('./src//common/../deploy')).toBe('src/deploy')
  })

  test('fails naming the directory as given', () => {
    expect.assertions(1)

    expect(() => checkWorkingDirectory('./does-not-exist')).toThrow(
      'Directory not found: ./does-not-exist'
    )
  })
})
