import { KeyLike, JWK } from 'jose'

import { DeploymentMetadata } from '@kubelt/types'

export interface KeyPair {
  publicKey: KeyLike | Uint8Array
  privateKey: KeyLike | Uint8Array
}

export interface KeyPairSerialized {
  publicKey: JWK
  privateKey: JWK
}

export interface Environment {
  Access: DurableObjectNamespace
  Authorization: DurableObjectNamespace
  Analytics: AnalyticsEngineDataset
  ServiceDeploymentMetadata: DeploymentMetadata
  EDGES: Fetcher
  Starbase: Fetcher
}

export type AuthorizationParameters = {
  redirectUri: string
  scope: Scope
  timestamp: number
}

export enum GrantType {
  AuthenticationCode = 'authentication_code', // validate and issue admin token from the account core
  AuthorizationCode = 'authorization_code', // validate and issue access token from starbase app
  RefreshToken = 'refresh_token', // valiate and refresh access token from starbase app
}

export enum ResponseType {
  Code = 'code',
}

export type Scope = string[]

export type AuthorizeResult = {
  code: string
  state: string
}

export type ExchangeTokenResult = {
  accessToken: string
  refreshToken: string
}

export type SessionDetails = {
  expired?: boolean
  creation?: string
  expiry?: string
  expiryTime?: number
}
