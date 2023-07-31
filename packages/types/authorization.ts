import { JWTPayload } from 'jose'

import { IdentityURN } from '@proofzero/urns/identity'

export type Scope = string[]
export type ScopeString = string

export enum GrantType {
  AuthenticationCode = 'authentication_code',
  AuthorizationCode = 'authorization_code',
  RefreshToken = 'refresh_token',
}

export enum ResponseType {
  Code = 'code',
}

export interface AuthorizationJWTPayload extends JWTPayload {
  aud: string[]
  sub: IdentityURN
  scope: ScopeString
}
