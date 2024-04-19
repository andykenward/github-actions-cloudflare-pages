import type {Scalars} from '@/gql/graphql.js'

export type PayloadGithubDeployment = {
  cloudflareId: string
  url: string
  commentId: Scalars['ID']['input'] | undefined
}

export type PayloadGithubDeploymentV2 = Omit<
  PayloadGithubDeployment,
  'cloudflareId'
> & {
  cloudflare: {
    id: string
    accountId: string
    projectName: string
  }
}
