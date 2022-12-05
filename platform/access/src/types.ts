import jose from 'jose'

import type { BaseApi } from '@kubelt/platform.commons/src/jsonrpc'
import type { AccountURN } from '@kubelt/urns/account'

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
  Authorization: DurableObjectNamespace
  Starbase: Fetcher
}

export type Scope = string[]

export type AuthorizationParameters = {
  redirectUri: string
  scope: Scope
}

export type AccessParameters = {
  account: string
  clientId: string
  scope: Scope
}

export type AuthorizeResult = {
  code: string
  state: string
}

export type GenerateResult = {
  accessToken: string
  refreshToken: string
}

export enum ResponseType {
  Code = 'code',
}

export enum GrantType {
  AuthenticationCode = 'authentication_code', // validate and issue admin token from the account core
  AuthorizationCode = 'authorization_code', // validate and issue access token from starbase app
  RefreshToken = 'refresh_token', // valiate and refresh access token from starbase app
}

export type AuthorizeOptions = {
  account: AccountURN
  responseType: ResponseType
  clientId: string
  redirectUri: string
  scope: Scope
  state: string
}

export type ExchangeCodeOptions<GrantType> = {
  account: AccountURN
  grantType: GrantType
  code: string
  redirectUri: string
  clientId: string
  clientSecret?: string
}

export type ExchangeAuthenticationCodeOptions =
  ExchangeCodeOptions<GrantType.AuthenticationCode>

export type ExchangeAuthorizationCodeOptions =
  ExchangeCodeOptions<GrantType.AuthorizationCode>

export type ExchangeRefreshTokenOptions = {
  grantType: GrantType.RefreshToken
  refreshToken: string
}

export type ExchangeTokenOptions =
  | ExchangeAuthenticationCodeOptions
  | ExchangeAuthorizationCodeOptions
  | ExchangeRefreshTokenOptions

export type ExchangeTokenResult = GenerateResult

export interface WorkerApi extends BaseApi {
  kb_authorize(options: AuthorizeOptions): Promise<AuthorizeResult>
  kb_exchangeToken(options: ExchangeTokenOptions): Promise<ExchangeTokenResult>
  kb_verifyAuthorization(token: string): Promise<jose.JWTVerifyResult>
}

export interface AuthorizationApi extends BaseApi {
  params(code: string): Promise<AuthorizationParameters>
  authorize(
    account: AccountURN,
    responseType: ResponseType,
    clientId: string,
    redirectUri: string,
    scope: Scope,
    state: string
  ): Promise<AuthorizeResult>
  exchangeToken(
    code: string,
    redirectUri: string,
    clientId: string
  ): Promise<ExchangeTokenResult>
}

export interface AccessApi extends BaseApi {
  generate(
    account: string,
    clientId: string,
    scope: Scope
  ): Promise<GenerateResult>
  verify(token: string): Promise<jose.JWTVerifyResult>
  refresh(token: string): Promise<GenerateResult>
}

export interface StarbaseApi extends BaseApi {
  kb_checkClientAuthorization(
    redirectUri: string,
    scope: Scope,
    clientId: string,
    clientSecret?: string
  ): Promise<boolean>
}
