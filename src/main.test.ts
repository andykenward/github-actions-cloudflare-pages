import core from '@actions/core'
import github from '@actions/github'
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
  type SpyInstance
} from 'vitest'

import {run} from './main'

const INPUT_GREETING = 'who-to-greet'
const ENV_INPUT_WHO_TO_GREET = `INPUT_${INPUT_GREETING.toUpperCase()}`

describe('action', () => {
  /** So we can reset process.env between tests */
  const env = process.env
  const consoleMock = vi.spyOn(console, 'log').mockImplementation(() => vi.fn())

  let spySetOutput: SpyInstance<
    Parameters<typeof core.setOutput>,
    ReturnType<typeof core.setOutput>
  >
  let spySetFailed: SpyInstance<
    Parameters<typeof core.setFailed>,
    ReturnType<typeof core.setFailed>
  >

  beforeEach(() => {
    vi.resetModules()
    /**
     * Reset process.env as GitHub Action inputs are on process.env.
     * This is used by `core.getInput()`.
     */
    process.env = {...env}

    vi.useFakeTimers()

    const date = new Date(2000, 1, 1, 13)
    vi.setSystemTime(date)

    spySetOutput = vi.spyOn(core, 'setOutput').mockImplementation(() => vi.fn())
    spySetFailed = vi
      .spyOn(core, 'setFailed')
      .mockImplementation(error => error)

    vi.spyOn(github.context, 'payload', 'get').mockReturnValue({
      repository: {name: 'unlike-action', owner: {login: 'andykenward'}}
    })
  })

  afterEach(() => {
    consoleMock.mockReset()
    /**
     * Reset process.env as GitHub Action inputs are on process.env.
     * This is used by `core.getInput()`.
     */
    process.env = {...env}
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  test('run', () => {
    /** For `core.getInput()` */
    process.env[ENV_INPUT_WHO_TO_GREET] = 'Andy'

    run()

    expect(process.env[ENV_INPUT_WHO_TO_GREET]).not.toBeUndefined()
    expect(consoleMock).toHaveBeenCalledWith(`Hello Andy!`)
    expect(spySetOutput).toHaveBeenCalledWith(
      'time',
      new Date(2000, 1, 1, 13).toTimeString()
    )
    expect(consoleMock).toHaveBeenCalledWith(
      `The event payload: ${JSON.stringify(
        {
          repository: {name: 'unlike-action', owner: {login: 'andykenward'}}
        },
        undefined,
        2
      )}`
    )
    expect(consoleMock).toHaveBeenCalledTimes(2)
    expect(spySetFailed).not.toHaveBeenCalled()
  })

  test(`should call setFailed when input ${INPUT_GREETING} is undefined`, () => {
    expect(() => run()).not.toThrow()
    expect(spySetFailed).toHaveBeenCalledWith(
      `Input required and not supplied: ${INPUT_GREETING}`
    )
    expect(process.env[ENV_INPUT_WHO_TO_GREET]).toBeUndefined()
    expect(consoleMock).not.toHaveBeenCalled()
    expect(spySetOutput).not.toHaveBeenCalled()
  })
})
