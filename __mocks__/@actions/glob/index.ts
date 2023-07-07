import {vi} from 'vitest'

export const create = vi.fn(() => ({
  glob: vi.fn(() => ['foo', 'bar'])
}))
