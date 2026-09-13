import * as Effect from 'effect/Effect'
import {vi} from 'vitest'

import type {
  addComment as originalAddComment,
  pullRequestToComment as originalPullRequestToComment
} from '../comment.js'

export const pullRequestToComment = vi.fn<typeof originalPullRequestToComment>(
  () => Effect.succeed('mock-pull-request-id')
)

export const addComment = vi.fn<typeof originalAddComment>(() =>
  Effect.succeed('mock-comment-id')
)
