import { DeploymentMetadata } from '@proofzero/types'

export interface Environment {
  Account: DurableObjectNamespace
  Authorization: DurableObjectNamespace
  ExchangeCode: DurableObjectNamespace
  Identity: DurableObjectNamespace
  IdentityGroup: DurableObjectNamespace
  StarbaseApp: DurableObjectNamespace

  EDGES: D1Database

  Core: Fetcher
  Email: Fetcher
  Images: Fetcher

  Analytics?: AnalyticsEngineDataset
  ServiceDeploymentMetadata?: DeploymentMetadata

  PASSPORT_URL: string
  INTERNAL_PASSPORT_SERVICE_NAME: string

  SECRET_JWK_CURRENT_KID: string
  SECRET_JWKS: string

  INTERNAL_APPLE_OAUTH_CLIENT_ID: string
  SECRET_APPLE_OAUTH_CLIENT_SECRET: string

  INTERNAL_DISCORD_OAUTH_CLIENT_ID: string
  SECRET_DISCORD_OAUTH_CLIENT_SECRET: string

  INTERNAL_GITHUB_OAUTH_CLIENT_ID: string
  SECRET_GITHUB_OAUTH_CLIENT_SECRET: string

  INTERNAL_GOOGLE_OAUTH_CLIENT_ID: string
  SECRET_GOOGLE_OAUTH_CLIENT_SECRET: string

  INTERNAL_MICROSOFT_OAUTH_CLIENT_ID: string
  SECRET_MICROSOFT_OAUTH_CLIENT_SECRET: string

  INTERNAL_TWITTER_OAUTH_CLIENT_ID: string
  SECRET_TWITTER_OAUTH_CLIENT_SECRET: string

  TTL_IN_MS: number
  MAX_ATTEMPTS: number
  DELAY_BETWEEN_REGENERATION_ATTEMPTS_IN_MS: number
  REGENERATION_COOLDOWN_PERIOD_IN_MS: number
  MAX_ATTEMPTS_TIME_PERIOD_IN_MS: number

  INTERNAL_DKIM_SELECTOR: string

  INTERNAL_CLOUDFLARE_ZONE_ID: string
  TOKEN_CLOUDFLARE_API: string

  POSTHOG_API_KEY: string
  SECRET_ZERODEV_PROJECTID: string
}
