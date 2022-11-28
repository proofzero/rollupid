import jose from 'jose'
import { BaseURN } from 'urns'

import type {
  BaseApi,
  DurableObjectApi,
} from '@kubelt/platform.commons/src/jsonrpc'
import { AccountURN } from '@kubelt/platform.account/src/types'

export type AccessURN = BaseURN<'threeid', 'access'>

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

export type AuthorizationRequest = {
  redirectUri: string
  scope: Scope
  state: string
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

export enum GrantType {
  AuthenticationCode = 'authentication_code', // validate and issue admin token from the account core
  AuthorizationCode = 'authorization_code', // validate and issue access token from starbase app
  RefreshToken = 'refresh_token', // valiate and refresh access token from starbase app
}

export enum ResponseType {
  Code = 'code',
}

export type ExchangeAuthorizationCodeResult = GenerateResult

export type VerifyAuthorizationResult = boolean
export type RefreshAuthorizationResult = GenerateResult

export interface WorkerApi extends BaseApi {
  kb_authorize(
    accountUrn: AccountURN,
    clientId: string,
    redirectUri: string,
    scope: Scope,
    state: string,
    responseType: ResponseType
  ): Promise<AuthorizeResult>
  kb_exchangeToken(
    grantType: GrantType,
    code: string,
    redirectUri: string,
    clientId: string,
    clientSecret: string
  ): Promise<ExchangeAuthorizationCodeResult>
  kb_verifyAuthorization(token: string): Promise<VerifyAuthorizationResult>
}

export interface AuthorizationApi extends DurableObjectApi {
  authorize(
    account: string,
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
    account: string,
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
