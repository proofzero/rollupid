import { decodeJwt } from 'jose'

import * as openrpc from '@kubelt/openrpc'
import type { RpcContext, RpcRequest, RpcService } from '@kubelt/openrpc'
import { ParamsArray } from '@kubelt/openrpc/impl/jsonrpc'

import { createFetcherJsonRpcClient } from '@kubelt/platform.commons/src/jsonrpc'

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
  const params: ExchangeTokenParams = (request.params as ParamsArray)[0]
  const { grantType } = params
  if (!grantType) {
    return openrpc.error(request, {
      code: -32500,
      message: 'missing grant type',
    })
  }

  const exchangeAuthenticationCode = async ({
    account,
    code,
    redirectUri,
    clientId,
  }: ExchangeAuthenticationCodeParams) => {
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

  const exchangeAuthorizationCode = async ({
    account,
    code,
    redirectUri,
    clientId,
    clientSecret,
  }: ExchangeAuthorizationCodeParams) => {
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
    const starbaseClient = createFetcherJsonRpcClient(context.get('Starbase'))
    const validated = await starbaseClient.kb_checkClientAuthorization(
      redirectUri,
      scope,
      clientId,
      clientSecret
    )
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

  const exchangeRefreshToken = async ({
    token,
  }: ExchangeRefreshTokenParams) => {
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
      params as ExchangeAuthenticationCodeParams
    )
    return openrpc.response(request, result)
  } else if (grantType == GrantType.AuthorizationCode) {
    const result = await exchangeAuthorizationCode(
      params as ExchangeAuthorizationCodeParams
    )
    return openrpc.response(request, result)
  } else if (grantType == GrantType.RefreshToken) {
    const result = await exchangeRefreshToken(
      params as ExchangeRefreshTokenParams
    )
    return openrpc.response(request, result)
  } else {
    return openrpc.error(request, {
      code: -32500,
      message: 'invalid grant type',
    })
  }
}
