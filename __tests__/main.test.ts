import cp from 'node:child_process'
import path from 'node:path'
import process from 'node:process'
import {describe, expect, test} from 'vitest'

import {wait} from '../src/wait'

describe('action', () => {
  test('throws invalid number', async () => {
    const input = Number.parseInt('foo', 10)
    await expect(wait(input)).rejects.toThrow('milliseconds not a number')
  })

  test('wait 500 ms', async () => {
    const start = new Date()
    await wait(500)
    const end = new Date()
    const delta = Math.abs(end.getTime() - start.getTime())
    expect(delta).toBeGreaterThan(450)
  })

  // shows how the runner will run a javascript action with env / stdout protocol
  test('runs', () => {
    process.env['INPUT_MILLISECONDS'] = '500'
    const np = process.execPath
    // eslint-disable-next-line unicorn/prefer-module
    const ip = path.join(__dirname, '..', 'lib', 'main.js')
    const options: cp.ExecFileSyncOptions = {
      env: process.env
    }
    const output = cp.execFileSync(np, [ip], options).toString()
    expect(output).toMatch(/::debug::waiting 500 milliseconds .../i)
  })
})
