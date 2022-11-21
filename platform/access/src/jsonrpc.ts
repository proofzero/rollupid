import { error } from 'itty-router-extras'
import * as jose from 'jose'
import {
  createRequestHandler,
  JsonRpcClient,
  JsonRpcRequest,
  JsonRpcResponse,
} from 'typed-json-rpc'

import { createFetcherJsonRpcClient } from '@kubelt/platform.commons/src/jsonrpc'
import { getCoreId } from '@kubelt/platform.commons/src/utils'

import {
  AccessApi,
  AuthorizationApi,
  AuthorizationRequest,
  AuthorizeResult,
  Environment,
  ExchangeAuthorizationCodeResult,
  RefreshAuthorizationResult,
  Scope,
  StarbaseApi,
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
      clientId: string,
      redirectUri: string,
      scope: Scope,
      state: string
    ): Promise<AuthorizeResult> {
      const coreId = await getCoreId(request, env)
      if (!coreId) {
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

      const client = getAuthorizationClient(`${coreId}/${clientId}`)
      return client.authorize(coreId, clientId, redirectUri, scope, state)
    },
    async kb_exchangeAuthorizationCode(
      code: string,
      redirectUri: string,
      clientId: string,
      clientSecret: string
    ): Promise<ExchangeAuthorizationCodeResult> {
      const coreId = await getCoreId(request, env)
      if (!coreId) {
        throw 'missing core identifier'
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

      const authorizationClient = getAuthorizationClient(
        `${coreId}/${clientId}`
      )
      const { scope } = (await authorizationClient.get(
        `codes/${code}`
      )) as AuthorizationRequest
      const validated = true

      // const { Starbase } = env
      // const starbaseClient = createFetcherJsonRpcClient<StarbaseApi>(Starbase)
      // const validated = await starbaseClient.kb_checkClientAuthorization(
      //   redirectUri,
      //   scope,
      //   clientId,
      //   clientSecret
      // )

      if (validated) {
        return authorizationClient.exchangeCode(code, redirectUri, clientId)
      } else {
        throw 'failed authorization attempt'
      }
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
    async kb_refreshAuthorization(
      token: string
    ): Promise<RefreshAuthorizationResult> {
      return getAccessClient(token).refresh(token)
    },
  })

  try {
    const jsonRpcRequest: JsonRpcRequest = await request.json()
    const jsonRpcResponse: JsonRpcResponse = await api.handleRequest(
      jsonRpcRequest
    )
    if ('error' in jsonRpcResponse) {
      console.error(jsonRpcResponse.error)
    }
    return new Response(JSON.stringify(jsonRpcResponse), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (err) {
    console.error(err)
    return error(500, JSON.stringify(err))
  }
}
