import { z } from 'zod'
import {
  GithubProfileSchema,
  GoogleProfileSchema,
  OAuthDataSchema,
} from './jsonrpc/validators/oauth'
import {
  CryptoAddressProfileSchema,
  GoogleRawProfileSchema,
  NFTarVoucherSchema,
  TwitterProfileSchema,
} from './jsonrpc/validators/profile'

export interface Environment {
  Access: Fetcher
  Analytics: AnalyticsEngineDataset
  Edges: Fetcher
  CryptoAddress: DurableObjectNamespace
  ContractAddress: DurableObjectNamespace
  OAuthAddress: DurableObjectNamespace

  HANDLES: KVNamespace

  COLLECTIONS: D1Database

  MINTPFP_CONTRACT_ADDRESS: string
  NFTAR_CHAIN_ID: string
  TOKEN_NFTAR: string
  NFTAR_URL: string

  BLOCKCHAIN_ACTIVITY: Queue
}

export enum NodeType {
  Crypto = 'crypto',
  Contract = 'contract',
  OAuth = 'oauth',
  Handle = 'handle',
}

export enum CryptoAddressType {
  Ethereum = 'ethereum',
  ETH = 'eth',
}

export enum ContractAddressType {
  Ethereum = 'ethereum',
  ETH = 'eth',
}

export enum OAuthAddressType {
  Google = 'google',
  GitHub = 'github',
  Twitter = 'twitter',
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
export type CryptoAddressProfile = z.infer<typeof CryptoAddressProfileSchema>
export type AddressProfile =
  | CryptoAddressProfile
  | OAuthGoogleProfile
  | OAuthTwitterProfile
  | OAuthGithubProfile

export type OAuthData = z.infer<typeof OAuthDataSchema>

export type NFTarVoucher = z.infer<typeof NFTarVoucherSchema>
