import { KeyLike, JWK } from 'jose'

import { DeploymentMetadata } from '@kubelt/types'
import { Scope } from '@kubelt/types/access'

import IdTokenProfileSchema from './jsonrpc/validators/IdTokenProfileSchema'
import { z } from 'zod'

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
  Edges: Fetcher
  Starbase: Fetcher
  Account: Fetcher
  INTERNAL_JWT_ISS: string
}

export type AuthorizationParameters = {
  redirectUri: string
  scope: Scope
  timestamp: number
}

export type AuthorizeResult = {
  code: string
  state: string
}

export type ExchangeTokenResult = {
  accessToken: string
  refreshToken: string
  idToken?: string
}

export type SessionDetails = {
  expired?: boolean
  creation?: string
  expiry?: string
  expiryTime?: number
}

export type IdTokenProfile = z.infer<typeof IdTokenProfileSchema>
