import { error } from 'itty-router-extras'
import * as jose from 'jose'
import {
  createRequestHandler,
  JsonRpcClient,
  JsonRpcRequest,
  JsonRpcResponse,
} from 'typed-json-rpc'

import { AccountURNSpace } from '@kubelt/urns/account'

import { createFetcherJsonRpcClient } from '@kubelt/platform.commons/src/jsonrpc'

import { URN_NODE_TYPE_AUTHORIZATION } from './constants'

import {
  AccessApi,
  AuthorizationApi,
  AuthorizeOptions,
  AuthorizeResult,
  Environment,
  ExchangeAuthenticationCodeOptions,
  ExchangeAuthorizationCodeOptions,
  ExchangeRefreshTokenOptions,
  ExchangeTokenOptions,
  ExchangeTokenResult,
  GrantType,
  StarbaseApi,
  WorkerApi,
} from './types'

import { AccessURN, AccessURNSpace } from '@kubelt/urns/access'

export default async (
  request: Request,
  env: Environment
): Promise<Response> => {
  const { Access, Authorization } = env
  const getAuthorizationClient = (
    name: AccessURN
  ): JsonRpcClient<AuthorizationApi> => {
    const fetcher = Authorization.get(Authorization.idFromName(name))
    return createFetcherJsonRpcClient<AuthorizationApi>(fetcher)
  }

  const getAccessClient = (token: string): JsonRpcClient<AccessApi> => {
    const payload = jose.decodeJwt(token)
    if (!payload) {
      throw 'missing JWT payload'
    }

    if (!payload.iss) {
      throw 'missing JWT issuer'
    }

    const fetcher = Access.get(Access.idFromString(payload.iss))
    return createFetcherJsonRpcClient<AccessApi>(fetcher)
  }

  const kb_authorize = ({
    account,
    responseType,
    clientId,
    redirectUri,
    scope,
    state,
  }: AuthorizeOptions): Promise<AuthorizeResult> => {
    if (!account) {
      throw 'missing core identifier'
    }

    if (!responseType) {
      throw 'missing response type'
    }

    if (!clientId) {
      throw 'missing client identifier'
    }

    if (!redirectUri) {
      throw 'missing redirect URI'
    }

    if (!scope || !scope.length) {
      throw 'missing scope'
    }

    const accountId = AccountURNSpace.decode(account)
    const urn = AccessURNSpace.fullUrn(accountId, {
      r: URN_NODE_TYPE_AUTHORIZATION,
      q: { clientId },
    })

    const client = getAuthorizationClient(urn)
    return client.authorize(
      account,
      responseType,
      clientId,
      redirectUri,
      scope,
      state
    )
  }

  const exchangeAuthenticationCode = ({
    account,
    code,
    redirectUri,
    clientId,
  }: ExchangeAuthenticationCodeOptions): Promise<ExchangeTokenResult> => {
    if (!account) {
      throw 'missing account'
    }

    if (!code) {
      throw 'missing authorization code'
    }

    if (!redirectUri) {
      throw 'missing redirect uri'
    }

    if (!clientId) {
      throw 'missing client identifier'
    }

    const accountId = AccountURNSpace.decode(account)
    const urn = AccessURNSpace.fullUrn(accountId, {
      r: URN_NODE_TYPE_AUTHORIZATION,
      q: { clientId },
    })
    const client = getAuthorizationClient(urn)
    return client.exchangeToken(code, redirectUri, clientId)
  }

  const exchangeAuthorizationCode = async ({
    account,
    code,
    redirectUri,
    clientId,
    clientSecret,
  }: ExchangeAuthorizationCodeOptions): Promise<ExchangeTokenResult> => {
    if (!account) {
      throw 'missing account'
    }

    if (!code) {
      throw 'missing authorization code'
    }

    if (!redirectUri) {
      throw 'missing redirect uri'
    }

    if (!clientId) {
      throw 'missing client identifier'
    }

    const urn = AccessURNSpace.fullUrn(account, {
      r: URN_NODE_TYPE_AUTHORIZATION,
      q: { clientId },
    })
    const authorizationClient = getAuthorizationClient(urn)

    const { scope } = await authorizationClient.params(code)
    const { Starbase } = env
    const starbaseClient = createFetcherJsonRpcClient<StarbaseApi>(Starbase)
    const validated = await starbaseClient.kb_checkClientAuthorization(
      redirectUri,
      scope,
      clientId,
      clientSecret
    )
    if (validated) {
      return authorizationClient.exchangeCode(code, redirectUri, clientId)
    } else {
      throw 'failed authorization attempt'
    }
  }

  const exchangeRefreshToken = ({
    refreshToken,
  }: ExchangeRefreshTokenOptions): Promise<ExchangeTokenResult> => {
    return getAccessClient(refreshToken).refresh(refreshToken)
  }

  const kb_exchangeToken = (
    options: ExchangeTokenOptions
  ): Promise<ExchangeTokenResult> => {
    const { grantType } = options
    if (!grantType) {
      throw 'missing grant type'
    }

    switch (grantType) {
      case GrantType.AuthenticationCode:
        return exchangeAuthenticationCode(options)
      case GrantType.AuthorizationCode:
        return exchangeAuthorizationCode(options)
      case GrantType.RefreshToken:
        return exchangeRefreshToken(options)
      default:
        throw 'invalid grant type'
    }
  }

  const kb_verifyAuthorization = (
    token: string
  ): Promise<jose.JWTVerifyResult> => {
    return getAccessClient(token).verify(token)
  }

  const api = createRequestHandler<WorkerApi>({
    kb_authorize,
    kb_exchangeToken,
    kb_verifyAuthorization,
  })

  try {
    const jsonRpcRequest: JsonRpcRequest = await request.json()
    const jsonRpcResponse: JsonRpcResponse = await api.handleRequest(
      jsonRpcRequest
    )
    if ('error' in jsonRpcResponse) {
      console.error(jsonRpcResponse.error)
      jsonRpcResponse.error = jsonRpcResponse.error.message || error
    }
    return new Response(JSON.stringify(jsonRpcResponse), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (err) {
    return error(500, JSON.stringify(err))
  }
}
