import {vi} from 'vitest'

export const create = vi.fn(() => ({
  uploadArtifact: vi.fn()
}))
