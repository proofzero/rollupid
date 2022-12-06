import * as openrpc from '@kubelt/openrpc'
import type { RpcContext, RpcRequest, RpcService } from '@kubelt/openrpc'
import { ParamsArray } from '@kubelt/openrpc/impl/jsonrpc'

import { AccessURNSpace } from '@kubelt/urns/access'
import { AccountURNSpace } from '@kubelt/urns/account'

import { URN_NODE_TYPE_AUTHORIZATION } from '../../constants'
import { AuthorizeParams, AuthorizeResult } from '../../types'

export default async (
  service: Readonly<RpcService>,
  request: Readonly<RpcRequest>,
  context: Readonly<RpcContext>
) => {
  const {
    account,
    responseType,
    clientId,
    redirectUri,
    scope,
    state,
  }: AuthorizeParams = (request.params as ParamsArray)[0]

  if (!account) {
    return openrpc.error(request, {
      code: -32500,
      message: 'missing account',
    })
  }

  if (!responseType) {
    return openrpc.error(request, {
      code: -32500,
      message: 'missing response type',
    })
  }

  if (!clientId) {
    return openrpc.error(request, {
      code: -32500,
      message: 'missing client identifier',
    })
  }

  if (!redirectUri) {
    return openrpc.error(request, {
      code: -32500,
      message: 'missing redirect URI',
    })
  }

  if (!scope || !scope.length) {
    return openrpc.error(request, {
      code: -32500,
      message: 'missing scope',
    })
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
  const result: AuthorizeResult = await authorizationClient.authorize({
    account,
    responseType,
    clientId,
    redirectUri,
    scope,
    state,
  })
  return openrpc.response(request, result)
}
