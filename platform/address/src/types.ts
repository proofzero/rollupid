import { z } from 'zod'

import { Scope } from '@kubelt/types/access'

import {
  AppleOAuthSchema,
  DiscordOAuthSchema,
  GithubOAuthSchema,
  GoogleOAuthSchema,
  MicrosoftOAuthSchema,
  OAuthDataSchema,
  TwitterOAuthSchema,
} from './jsonrpc/validators/oauth'
import {
  CryptoAddressProfileSchema,
  NFTarVoucherSchema,
} from './jsonrpc/validators/profile'
import { DeploymentMetadata } from '@kubelt/types'

export interface Environment {
  Access: Fetcher
  Edges: Fetcher
  Images: Fetcher
  Email: Fetcher
  Address: DurableObjectNamespace
  Analytics: AnalyticsEngineDataset
  ServiceDeploymentMetadata: DeploymentMetadata

  HANDLES: KVNamespace

  MINTPFP_CONTRACT_ADDRESS: string
  NFTAR_CHAIN_ID: string
  TOKEN_NFTAR: string
  NFTAR_URL: string

  BLOCKCHAIN_ACTIVITY: Queue

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
}

export interface Challenge {
  address: string
  template: string
  redirectUri: string
  scope: Scope
  state: string
  timestamp: number
}

export type OAuthGoogleProfile = z.infer<typeof GoogleOAuthSchema>['_json']
export type OAuthTwitterProfile = z.infer<typeof TwitterOAuthSchema>
export type OAuthGithubProfile = z.infer<typeof GithubOAuthSchema>['_json']
export type OAuthMicrosoftProfile = z.infer<
  typeof MicrosoftOAuthSchema
>['_json']
export type OAuthAppleProfile = z.infer<typeof AppleOAuthSchema>
export type OAuthDiscordProfile = z.infer<typeof DiscordOAuthSchema>['__json']

export type CryptoAddressProfile = z.infer<typeof CryptoAddressProfileSchema>
export type AddressProfile =
  | CryptoAddressProfile
  | OAuthGoogleProfile
  | OAuthTwitterProfile
  | OAuthGithubProfile
  | OAuthMicrosoftProfile
  | OAuthAppleProfile
  | OAuthDiscordProfile

export type AddressProfiles = AddressProfile[]

export type OAuthData = z.infer<typeof OAuthDataSchema>

export type NFTarVoucher = z.infer<typeof NFTarVoucherSchema>
