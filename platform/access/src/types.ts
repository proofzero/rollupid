import { Scope } from '@proofzero/types/access'

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
