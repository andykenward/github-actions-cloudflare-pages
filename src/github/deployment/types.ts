import type {Scalars} from '@/gql/graphql.js'

export type PayloadGithubDeployment = {
  cloudflareId: string
  url: string
  commentId: Scalars['ID']['input'] | undefined
}
