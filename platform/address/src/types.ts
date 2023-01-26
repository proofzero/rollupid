import { z } from 'zod'
import {
  AppleProfileSchema,
  GithubProfileSchema,
  GoogleProfileSchema,
  MicrosoftProfileSchema,
  OAuthDataSchema,
} from './jsonrpc/validators/oauth'
import {
  CryptoAddressProfileSchema,
  NFTarVoucherSchema,
  TwitterProfileSchema,
} from './jsonrpc/validators/profile'
import { DeploymentMetadata } from '@kubelt/types'

export interface Environment {
  Access: Fetcher
  Edges: Fetcher
  Images: Fetcher
  Address: DurableObjectNamespace
  Analytics: AnalyticsEngineDataset
  ServiceDeploymentMetadata: DeploymentMetadata

  HANDLES: KVNamespace

  MINTPFP_CONTRACT_ADDRESS: string
  NFTAR_CHAIN_ID: string
  TOKEN_NFTAR: string
  NFTAR_URL: string

  BLOCKCHAIN_ACTIVITY: Queue
}

export enum NodeType {
  Crypto = 'crypto',
  Vault = 'vault',
  Contract = 'contract',
  OAuth = 'oauth',
  Handle = 'handle',
}

export enum CryptoAddressType {
  ETH = 'eth',
}

export enum ContractAddressType {
  ETH = 'eth',
}

export enum OAuthAddressType {
  Google = 'google',
  GitHub = 'github',
  Twitter = 'twitter',
  Microsoft = 'microsoft',
  Apple = 'apple',
}

export enum HandleAddressType {
  Handle = 'handle',
}

export type AddressType =
  | CryptoAddressType
  | OAuthAddressType
  | ContractAddressType
  | HandleAddressType

export interface Challenge {
  address: string
  template: string
  redirectUri: string
  scope: string[]
  state: string
  timestamp: number
}

export type OAuthGoogleProfile = z.infer<typeof GoogleProfileSchema>['_json']
export type OAuthTwitterProfile = z.infer<typeof TwitterProfileSchema>
export type OAuthGithubProfile = z.infer<typeof GithubProfileSchema>['_json']
export type OAuthMicrosoftProfile = z.infer<
  typeof MicrosoftProfileSchema
>['_json']
export type OAuthAppleProfile = z.infer<typeof AppleProfileSchema>

export type CryptoAddressProfile = z.infer<typeof CryptoAddressProfileSchema>
export type AddressProfile =
  | CryptoAddressProfile
  | OAuthGoogleProfile
  | OAuthTwitterProfile
  | OAuthGithubProfile
  | OAuthMicrosoftProfile
  | OAuthAppleProfile

export type OAuthData = z.infer<typeof OAuthDataSchema>

export type NFTarVoucher = z.infer<typeof NFTarVoucherSchema>
