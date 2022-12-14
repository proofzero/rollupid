import { decodeJwt } from 'jose'

import * as openrpc from '@kubelt/openrpc'
import type { RpcContext, RpcRequest, RpcService } from '@kubelt/openrpc'

import type { StarbaseApi } from '@kubelt/platform-clients/starbase'

import { AccessURNSpace } from '@kubelt/urns/access'
import { AccountURNSpace } from '@kubelt/urns/account'

import { URN_NODE_TYPE_AUTHORIZATION } from '../../constants'
import {
  ExchangeAuthenticationCodeParams,
  ExchangeAuthorizationCodeParams,
  ExchangeRefreshTokenParams,
  ExchangeTokenParams,
  ExchangeTokenResult,
  GrantType,
} from '../../types'

export default async (
  service: Readonly<RpcService>,
  request: Readonly<RpcRequest>,
  context: Readonly<RpcContext>
) => {
  const [grantType] = (request.params as ExchangeTokenParams).splice(0, 1)
  if (!grantType) {
    return openrpc.error(request, {
      code: -32500,
      message: 'missing grant type',
    })
  }

  const exchangeAuthenticationCode = async (
    params: ExchangeAuthenticationCodeParams
  ) => {
    const [account, code, redirectUri, clientId] = params
    console.log({ params })
    console.log({ account, code, redirectUri, clientId })
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
    const name = AccessURNSpace.fullUrn(accountId, {
      r: URN_NODE_TYPE_AUTHORIZATION,
      q: { clientId },
    })

    const Authorization = context.get('Authorization')
    const authorizationClient = await openrpc.discover(Authorization, {
      name,
    })
    const { scope } = await authorizationClient.exchangeToken({
      account,
      code,
      redirectUri,
      clientId,
    })
    const Access = context.get('Access')
    const accessClient = await openrpc.discover(Access)
    const objectId = accessClient.$.id
    const result: ExchangeTokenResult = await accessClient.generate({
      objectId,
      account,
      clientId,
      scope,
    })
    return openrpc.response(request, result)
  }

  const exchangeAuthorizationCode = async (
    params: ExchangeAuthorizationCodeParams
  ) => {
    const [account, code, redirectUri, clientId, clientSecret] = params
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

    const name = AccessURNSpace.fullUrn(account, {
      r: URN_NODE_TYPE_AUTHORIZATION,
      q: { clientId },
    })
    const Authorization = context.get('Authorization')
    const authorizationClient = await openrpc.discover(Authorization, {
      name,
    })
    const { scope } = await authorizationClient.params(code)
    const starbaseClient: StarbaseApi = context.get('Starbase')
    const validated = await starbaseClient.kb_appAuthCheck({
      redirectURI: redirectUri,
      scopes: scope,
      clientId,
      clientSecret,
    })
    if (validated) {
      const { scope } = await authorizationClient.exchangeCode(
        code,
        redirectUri,
        clientId
      )
      const Access = context.get('Access')
      const accessClient = await openrpc.discover(Access)
      const result: ExchangeTokenResult = await accessClient.generate(
        account,
        clientId,
        scope
      )
      return openrpc.response(request, result)
    } else {
      return openrpc.error(request, {
        code: -32500,
        message: 'failed authorization attempt',
      })
    }
  }

  const exchangeRefreshToken = async (params: ExchangeRefreshTokenParams) => {
    const [token] = params
    const payload = decodeJwt(token)
    if (!payload) {
      return openrpc.error(request, {
        code: -32500,
        message: 'missing JWT payload',
      })
    }

    if (!payload.iss) {
      return openrpc.error(request, {
        code: -32500,
        message: 'missing JWT issuer',
      })
    }

    const { iss: id } = payload

    const Access = context.get('Access')
    const accessClient = await openrpc.discover(Access, { id })
    const result: ExchangeTokenResult = await accessClient.refresh({
      objectId: id,
      token,
    })
    return openrpc.response(request, result)
  }

  if (grantType == GrantType.AuthenticationCode) {
    const result = await exchangeAuthenticationCode(
      request.params as ExchangeAuthenticationCodeParams
    )
    return result
  } else if (grantType == GrantType.AuthorizationCode) {
    const result = await exchangeAuthorizationCode(
      request.params as ExchangeAuthorizationCodeParams
    )
    return result
  } else if (grantType == GrantType.RefreshToken) {
    const result = await exchangeRefreshToken(
      request.params as ExchangeRefreshTokenParams
    )
    return result
  } else {
    return openrpc.error(request, {
      code: -32500,
      message: 'invalid grant type',
    })
  }
}
