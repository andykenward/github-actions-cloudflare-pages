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

describe('action', () => {
  const consoleMock = vi.spyOn(console, 'log').mockImplementation(() => vi.fn())
  let inputs: Record<string, string | undefined>
  let spySetOutput: SpyInstance<
    Parameters<typeof core.setOutput>,
    ReturnType<typeof core.setOutput>
  >
  let spySetFailed: SpyInstance<
    Parameters<typeof core.setFailed>,
    ReturnType<typeof core.setFailed>
  >

  beforeEach(() => {
    inputs = {}
    vi.useFakeTimers()

    const date = new Date(2000, 1, 1, 13)
    vi.setSystemTime(date)

    vi.spyOn(core, 'getInput').mockImplementation(name => inputs[name] || '')
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
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  test('run', () => {
    inputs['who-to-greet'] = 'Andy'

    run()

    expect(consoleMock).toHaveBeenCalledWith(`Hello Andy!`)
    expect(spySetOutput).toHaveBeenCalledWith(
      'time',
      new Date(2000, 1, 1, 13).toTimeString()
    )
    const payload = JSON.stringify(
      {
        repository: {name: 'unlike-action', owner: {login: 'andykenward'}}
      },
      undefined,
      2
    )
    expect(consoleMock).toHaveBeenCalledWith(`The event payload: ${payload}`)

    expect(consoleMock).toHaveBeenCalledTimes(2)

    expect(spySetFailed).not.toHaveBeenCalled()
  })

  test('should setFailed on error', () => {
    spySetOutput.mockImplementationOnce(() => {
      throw new Error('setOutput error')
    })
    // We want to catch any thrown errors and call setFailed.
    expect(() => run()).not.toThrow()
    expect(spySetFailed).toHaveBeenCalledWith('setOutput error')

    expect(consoleMock).toHaveBeenCalledTimes(1)
    expect(consoleMock).toHaveBeenCalledWith(`Hello !`)
    expect(spySetOutput).toHaveBeenCalledWith(
      'time',
      new Date(2000, 1, 1, 13).toTimeString()
    )
  })
})
