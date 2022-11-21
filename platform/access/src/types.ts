import jose from 'jose'

import type {
  BaseApi,
  DurableObjectApi,
} from '@kubelt/platform.commons/src/jsonrpc'

export interface KeyPair {
  publicKey: jose.KeyLike | Uint8Array
  privateKey: jose.KeyLike | Uint8Array
}

export interface KeyPairSerialized {
  publicKey: jose.JWK
  privateKey: jose.JWK
}

export interface Environment {
  Access: DurableObjectNamespace
  Address: Fetcher
  Authorization: DurableObjectNamespace
  Starbase: Fetcher
}

export type Scope = string[]

export type AuthorizationRequest = {
  redirectUri: string
  scope: Scope
  state: string
}

export type AccessParameters = {
  coreId: string
  clientId: string
  scope: Scope
}

export type AuthorizeResult = {
  code: string
  state: string
  diff?: string[]
  isAuthorized: boolean
}

export type GenerateResult = {
  accessToken: string
  refreshToken: string
}

export type ExchangeAuthorizationCodeResult = GenerateResult

export type VerifyAuthorizationResult = boolean
export type RefreshAuthorizationResult = GenerateResult

export interface WorkerApi {
  kb_authorize(
    clientId: string,
    redirectUri: string,
    scope: Scope,
    state: string
  ): Promise<AuthorizeResult>
  kb_exchangeAuthorizationCode(
    code: string,
    redirectUri: string,
    clientId: string,
    clientSecret: string
  ): Promise<ExchangeAuthorizationCodeResult>
  kb_verifyAuthorization(token: string): Promise<VerifyAuthorizationResult>
  kb_refreshAuthorization(token: string): Promise<RefreshAuthorizationResult>
}

export interface AuthorizationApi extends DurableObjectApi {
  authorize(
    coreId: string,
    clientId: string,
    redirectUri: string,
    scope: Scope,
    state: string
  ): Promise<AuthorizeResult>
  exchangeCode(
    code: string,
    redirectUri: string,
    clientId: string
  ): Promise<ExchangeAuthorizationCodeResult>
}

export interface AccessApi extends BaseApi {
  generate(
    coreId: string,
    clientId: string,
    scope: Scope
  ): Promise<GenerateResult>
  verify(token: string): Promise<jose.JWTVerifyResult>
  refresh(token: string): Promise<RefreshAuthorizationResult>
}

export interface StarbaseApi extends BaseApi {
  kb_checkClientAuthorization(
    redirectUri: string,
    scope: Scope,
    clientId: string,
    clientSecret: string
  ): Promise<boolean>
}
