import jose from 'jose'
import { Func } from 'typed-json-rpc'

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
  Account: Fetcher
  Address: Fetcher
  Authorization: DurableObjectNamespace
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

export type ExchangeCodeResult = GenerateResult

export type RefreshResult = GenerateResult

export interface WorkerApi {
  kb_authorize(
    clientId: string,
    redirectUri: string,
    scope: string,
    state: string
  ): Promise<AuthorizeResult>
  kb_exchangeCode(
    code: string,
    redirectUri: string,
    clientId: string,
    clientSecret: string
  ): Promise<ExchangeCodeResult>
  kb_verifyAuthorization(token: string): Promise<boolean>
  kb_refreshToken(token: string): Promise<RefreshResult>
}

export interface AuthorizationApi {
  [key: string]: Func
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
    clientId: string,
    clientSecret: string
  ): Promise<ExchangeCodeResult>
}

export interface AccessApi {
  [key: string]: Func
  generate(
    coreId: string,
    clientId: string,
    scope: Scope
  ): Promise<GenerateResult>
  verify(token: string): Promise<jose.JWTVerifyResult>
  refresh(token: string): Promise<RefreshResult>
}
