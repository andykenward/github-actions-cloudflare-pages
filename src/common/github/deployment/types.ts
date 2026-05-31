export type PayloadGithubDeployment = {
  cloudflareId: string
  url: string
  commentId: string | undefined
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
