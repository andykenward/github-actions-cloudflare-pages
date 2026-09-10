import * as Effect from 'effect/Effect'
import {vi} from 'vitest'

import type {addComment as originalAddComment} from '../comment.js'

export const pullRequestToComment = Effect.succeed('mock-pull-request-id')

export const addComment = vi.fn<typeof originalAddComment>(() =>
  Effect.succeed('mock-comment-id')
)
