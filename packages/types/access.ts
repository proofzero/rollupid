import { JWTPayload } from 'jose'

import { AccountURN } from '@kubelt/urns/account'

export type Scope = string[]

export enum GrantType {
  AuthenticationCode = 'authentication_code',
  AuthorizationCode = 'authorization_code',
  RefreshToken = 'refresh_token',
}

export enum ResponseType {
  Code = 'code',
}

export interface AccessJWTPayload extends JWTPayload {
  aud: string[]
  sub: AccountURN
  scope: Scope
}
