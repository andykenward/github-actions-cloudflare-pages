import * as Effect from 'effect/Effect'
import {vi} from 'vitest'

import type * as Original from '../comment.js'

/** The real body, so tests can assert what a comment says. */
const actual = await vi.importActual<typeof Original>('../comment.js')
export const {commentBody} = actual

export const pullRequestToComment = vi.fn<typeof Original.pullRequestToComment>(
  () => Effect.succeed('mock-pull-request-id')
)

export const upsertComment = vi.fn<typeof Original.upsertComment>(() =>
  Effect.succeed('mock-comment-id')
)

export const updateComment = vi.fn<typeof Original.updateComment>(
  () => Effect.void
)
