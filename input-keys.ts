export const INPUT_KEY_CLOUDFLARE_ACCOUNT_ID = 'cloudflare-account-id' as const
export const INPUT_KEY_CLOUDFLARE_API_TOKEN = 'cloudflare-api-token' as const
export const INPUT_KEY_CLOUDFLARE_PROJECT_NAME =
  'cloudflare-project-name' as const
export const INPUT_KEY_DIRECTORY = 'directory' as const
export const INPUT_KEY_GITHUB_ENVIRONMENT = 'github-environment' as const
export const INPUT_KEY_GITHUB_TOKEN = 'github-token' as const

export const INPUT_KEYS_REQUIRED = [
  INPUT_KEY_CLOUDFLARE_ACCOUNT_ID,
  INPUT_KEY_CLOUDFLARE_API_TOKEN,
  INPUT_KEY_CLOUDFLARE_PROJECT_NAME,
  INPUT_KEY_DIRECTORY,
  INPUT_KEY_GITHUB_ENVIRONMENT,
  INPUT_KEY_GITHUB_TOKEN
] as const
