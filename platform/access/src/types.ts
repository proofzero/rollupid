import { DeploymentMetadata } from '@proofzero/types'
import { Scope } from '@proofzero/types/access'

export interface Environment {
  Access: DurableObjectNamespace
  Authorization: DurableObjectNamespace
  Analytics: AnalyticsEngineDataset
  ServiceDeploymentMetadata: DeploymentMetadata
  Edges: Fetcher
  Starbase: Fetcher
  Account: Fetcher
  Address: Fetcher
  SECRET_JWK_CURRENT_KID: string
  SECRET_JWKS: string
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
