import type {
  AuthorizeResult,
  ExchangeTokenResult,
  GrantType,
  ResponseType,
  Scope,
} from '@kubelt/platform.access/src/types'

import type { AccountURN } from '@kubelt/urns/account'

import type { BaseApi } from './base'
import createClient from './fetcher'

interface Authorize {
  (
    account: AccountURN,
    responseType: ResponseType,
    clientId: string,
    redirectUri: string,
    scope: Scope,
    state: string
  ): Promise<AuthorizeResult>
}

export interface ExchangeToken {
  (
    grantType: GrantType.AuthenticationCode,
    account: AccountURN,
    code: string,
    redirectUri: string,
    clientId: string
  ): Promise<ExchangeTokenResult>
  (
    grantType: GrantType.AuthorizationCode,
    account: AccountURN,
    code: string,
    redirectUri: string,
    clientId: string,
    clientSecret: string
  ): Promise<ExchangeTokenResult>
  (
    grantType: GrantType.RefreshToken,
    token: string
  ): Promise<ExchangeTokenResult>
}

interface VerifyAuthorization {
  (token: string): Promise<object>
}

export interface AccessApi extends BaseApi {
  kb_authorize: Authorize
  kb_exchangeToken: ExchangeToken
  kb_verifyAuthorization: VerifyAuthorization
}

export default (fetcher: Fetcher, requestInit: RequestInit | Request = {}) =>
  createClient(fetcher, requestInit) as AccessApi
