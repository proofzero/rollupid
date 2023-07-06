import { z } from 'zod'

import { Scope } from '@proofzero/types/access'
import { DeploymentMetadata } from '@proofzero/types'

import { OAuthDataSchema } from './jsonrpc/validators/oauth'

export interface Environment {
  Access: Fetcher
  Edges: Fetcher
  Images: Fetcher
  Email: Fetcher
  Address: DurableObjectNamespace
  Analytics: AnalyticsEngineDataset
  ServiceDeploymentMetadata: DeploymentMetadata

  HANDLES: KVNamespace

  BLOCKCHAIN_ACTIVITY: Queue

  PASSPORT_URL: string

  TTL_IN_MS: number
  MAX_ATTEMPTS: number
  DELAY_BETWEEN_REGENERATION_ATTEMPTS_IN_MS: number
  REGENERATION_COOLDOWN_PERIOD_IN_MS: number
  MAX_ATTEMPTS_TIME_PERIOD_IN_MS: number

  SECRET_ZERODEV_PROJECTID: string

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

  POSTHOG_API_KEY: string
  POSTHOG_HOST: string
}

export interface Challenge {
  address: string
  template: string
  redirectUri: string
  scope: Scope
  state: string
  timestamp: number
}

export interface AddressProfile<Type = string> {
  type: Type
  address: string
  title: string
  icon?: string
  disconnected?: boolean
}

export type AddressProfiles = AddressProfile[]

export type OAuthData = z.infer<typeof OAuthDataSchema>

export interface GitHubOAuthProfile {
  login: string
  name: string
  avatar_url: string
}

export interface AppleOAuthProfile {
  email: string
  name: string
  picture: string
}

export interface DiscordOAuthProfile {
  id: string
  username: string
  discriminator: string
  avatar: string
}

export interface GoogleOAuthProfile {
  email: string
  name: string
  picture: string
}

export interface MicrosoftOAuthProfileCommon {
  email: string
}

export interface MicrosoftOAuthProfilePersonal
  extends MicrosoftOAuthProfileCommon {
  givenname: string
  familyname: string
}

export interface MicrosoftOAuthProfileWork extends MicrosoftOAuthProfileCommon {
  name: string
  given_name: string
  family_name: string
}

export type MicrosoftOAuthProfile =
  | MicrosoftOAuthProfilePersonal
  | MicrosoftOAuthProfileWork

export interface TwitterOAuthProfile {
  name: string
  screen_name: string
  profile_image_url_https: string
}
