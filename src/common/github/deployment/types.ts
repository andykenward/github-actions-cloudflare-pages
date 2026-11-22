import * as Schema from 'effect/Schema'

export const CommentId = Schema.optional(Schema.String)

/** Payloads written before the Cloudflare account/project were embedded. */
export const PayloadV1 = Schema.Struct({
  url: Schema.String,
  commentId: CommentId,
  cloudflareId: Schema.String
})

/** Payloads written once the Cloudflare deployment had finished. */
export const PayloadV2 = Schema.Struct({
  url: Schema.String,
  commentId: CommentId,
  cloudflare: Schema.Struct({
    id: Schema.String,
    accountId: Schema.String,
    projectName: Schema.String
  })
})

/** The version `createGitHubDeployment` writes. */
export const PAYLOAD_VERSION = 3

/**
 * The current payload, written by `createGitHubDeployment` before wrangler
 * runs — so it has no Cloudflare id or URL. A payload can't be changed after
 * it is created: the deploy records them on the final status instead, where
 * the delete action reads them back.
 */
export const PayloadV3 = Schema.Struct({
  version: Schema.Literal(PAYLOAD_VERSION),
  commentId: CommentId,
  cloudflare: Schema.Struct({
    accountId: Schema.String,
    projectName: Schema.String
  })
})

export type PayloadGithubDeploymentV1 = typeof PayloadV1.Type

export type PayloadGithubDeploymentV2 = typeof PayloadV2.Type

/**
 * What `getPayload` gives for any version. A V3 payload has no `url` or
 * `cloudflare.id`; they come from the deployment's latest status.
 */
export type PayloadGithubDeployment = {
  url?: string
  commentId?: string | undefined
  cloudflare: {id?: string; accountId: string; projectName: string}
}

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
