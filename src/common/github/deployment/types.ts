import * as Schema from 'effect/Schema'

const CommentId = Schema.optional(Schema.String)

/** Payloads written before the Cloudflare account/project were embedded. */
export const PayloadV1 = Schema.Struct({
  url: Schema.String,
  commentId: CommentId,
  cloudflareId: Schema.String
})

/** The current payload shape, written by `createGitHubDeployment`. */
export const PayloadV2 = Schema.Struct({
  url: Schema.String,
  commentId: CommentId,
  cloudflare: Schema.Struct({
    id: Schema.String,
    accountId: Schema.String,
    projectName: Schema.String
  })
})

export type PayloadGithubDeployment = typeof PayloadV1.Type

export type PayloadGithubDeploymentV2 = typeof PayloadV2.Type
