import {mkdtempSync, rmSync, writeFileSync} from 'node:fs'
import {EOL, tmpdir} from 'node:os'
import path from 'node:path'

import {debug, isDebug} from '@actions/core'
import {describe, expect, onTestFinished, test, vi} from 'vitest'

import {getWorkflowEvent} from '@/common/github/workflow-event/workflow-event.js'

vi.mock(import('@actions/core'))

describe(getWorkflowEvent, () => {
  test('reads the event name and its payload file', () => {
    expect.assertions(3)

    vi.stubEnv('GITHUB_EVENT_NAME', 'push')
    vi.stubEnv(
      'GITHUB_EVENT_PATH',
      '__generated__/payloads/api.github.com/push/with-new-branch.payload.json'
    )

    const {eventName, payload} = getWorkflowEvent()

    expect(eventName).toBe('push')
    expect(payload).toMatchObject({
      ref: 'refs/heads/master',
      repository: {node_id: 'MDEwOlJlcG9zaXRvcnkxODY4NTMwMDI='}
    })
    // The payload is large: it is logged only with step debug logging on.
    expect(debug).not.toHaveBeenCalled()
  })

  test.each([
    {
      eventName: 'not_an_event',
      message: 'eventName not_an_event is not supported'
    },
    {eventName: undefined, message: 'eventName undefined is not supported'}
  ])('throws for GITHUB_EVENT_NAME $eventName', ({eventName, message}) => {
    expect.assertions(1)

    vi.stubEnv('GITHUB_EVENT_NAME', eventName)

    expect(() => getWorkflowEvent()).toThrow(message)
  })

  test('says so and returns no payload when the event file does not exist', () => {
    expect.assertions(2)

    const write = vi.spyOn(process.stdout, 'write').mockReturnValue(true)
    onTestFinished(() => write.mockRestore())
    vi.stubEnv('GITHUB_EVENT_PATH', '/does/not/exist/event.json')

    expect(getWorkflowEvent()).toStrictEqual({
      eventName: 'pull_request',
      payload: undefined
    })
    expect(write).toHaveBeenCalledWith(
      `GITHUB_EVENT_PATH /does/not/exist/event.json does not exist${EOL}`
    )
  })

  test('throws naming the event file when it is not valid JSON', () => {
    expect.assertions(1)

    const directory = mkdtempSync(path.join(tmpdir(), 'workflow-event-'))
    onTestFinished(() => rmSync(directory, {recursive: true, force: true}))
    const file = path.join(directory, 'event.json')
    // A truncated payload.
    writeFileSync(file, '{"action": "opened", "number": 2')
    vi.stubEnv('GITHUB_EVENT_PATH', file)

    expect(() => getWorkflowEvent()).toThrow(
      `GITHUB_EVENT_PATH ${file} is not valid JSON`
    )
  })

  test('logs the event name and payload with step debug logging on', () => {
    expect.assertions(2)

    vi.mocked(isDebug).mockReturnValueOnce(true)

    const {payload} = getWorkflowEvent()

    expect(debug).toHaveBeenCalledWith('eventName: pull_request')
    expect(debug).toHaveBeenCalledWith(`payload: ${JSON.stringify(payload)}`)
  })
})
