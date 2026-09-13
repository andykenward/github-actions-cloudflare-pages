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

export type PayloadGithubDeploymentV1 = typeof PayloadV1.Type

/**
 * A deployment as the REST list endpoint returns it — only the fields the
 * delete action reads; decoding drops the rest. `payload` arrives as the
 * object GitHub stored, or as a JSON string: `getPayload` decodes either.
 */
export const GitHubDeployment = Schema.Struct({
  node_id: Schema.String,
  environment: Schema.String,
  payload: Schema.Unknown
})

export type GitHubDeployment = typeof GitHubDeployment.Type

export type PayloadGithubDeploymentV2 = typeof PayloadV2.Type
