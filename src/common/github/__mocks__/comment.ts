import {vi} from 'vitest'

import {addComment as originalAddComment} from '../comment.js'

export const addComment = vi
  .fn()
  .mockResolvedValue(
    'mock-comment-id' satisfies Awaited<ReturnType<typeof originalAddComment>>
  )
