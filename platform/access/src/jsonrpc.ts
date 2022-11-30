import { error } from 'itty-router-extras'
import * as jose from 'jose'
import {
  createRequestHandler,
  JsonRpcClient,
  JsonRpcRequest,
  JsonRpcResponse,
} from 'typed-json-rpc'

import { accountURNSpace } from '@kubelt/platform.account/src/utils'
import { AccountURN } from '@kubelt/platform.account/src/types'

import { createFetcherJsonRpcClient } from '@kubelt/platform.commons/src/jsonrpc'

import {
  AccessApi,
  AuthorizationApi,
  AuthorizeResult,
  Environment,
  ExchangeAuthorizationCodeResult,
  GrantType,
  Scope,
  WorkerApi,
} from './types'

export default async (
  request: Request,
  env: Environment
): Promise<Response> => {
  const { Access, Authorization } = env
  const getAuthorizationClient = (
    name: string
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

  const api = createRequestHandler<WorkerApi>({
    async kb_authorize(
      accountUrn: AccountURN,
      clientId: string,
      redirectUri: string,
      scope: Scope,
      state: string
    ): Promise<AuthorizeResult> {
      if (!accountUrn) {
        throw 'missing core identifier'
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

      // TODO: utility?

      const account = accountURNSpace.decode(accountUrn)

      const authorizationUrn = `urn:threeid:access/${account}?+node_type=authoirzation?=clientId=${clientId}`

      const client = getAuthorizationClient(authorizationUrn)
      return client.authorize(account, clientId, redirectUri, scope, state)
    },
    async kb_exchangeToken(
      // todo: should overload this with diff params
      grantType: GrantType,
      code: string,
      redirectUri: string,
      clientId: string,
      clientSecret: string
    ): Promise<ExchangeAuthorizationCodeResult> {
      if (!grantType) {
        throw 'missing grant type'
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

      if (!clientSecret) {
        throw 'missing client secret'
      }

      switch (grantType) {
        case GrantType.AuthenticationCode: {
          const authorizationUrn = `urn:threeid:access/${clientSecret}?+node_type=authoirzation?=clientId=${clientId}`
          const authorizationClient = getAuthorizationClient(authorizationUrn)
          return authorizationClient.exchangeCode(code, redirectUri, clientId)
        }
      }

      throw 'invalid grant type'
    },
    async kb_verifyAuthorization(token: string): Promise<boolean> {
      const client = getAccessClient(token)
      try {
        await client.verify(token)
        return true
      } catch (err) {
        console.error(err)
        return false
      }
    },
  })

  try {
    const jsonRpcRequest: JsonRpcRequest = await request.json()
    const jsonRpcResponse: JsonRpcResponse = await api.handleRequest(
      jsonRpcRequest
    )
    return new Response(JSON.stringify(jsonRpcResponse), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (err) {
    return error(500, JSON.stringify(err))
  }
}
