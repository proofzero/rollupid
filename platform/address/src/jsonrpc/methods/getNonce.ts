import * as openrpc from '@kubelt/openrpc'
import type { RpcContext, RpcRequest, RpcService } from '@kubelt/openrpc'
import { ParamsArray } from '@kubelt/openrpc/impl/jsonrpc'

import { CryptoAddressType, GetNonceParams } from '../../types'

export default async (
  service: Readonly<RpcService>,
  request: Readonly<RpcRequest>,
  context: Readonly<RpcContext>
) => {
  const { address, template, redirectUri, scope, state }: GetNonceParams = (
    request.params as ParamsArray
  )[0]

  const addressType = context.get('addr_type')
  switch (addressType) {
    case CryptoAddressType.Ethereum:
      break
    default:
      return openrpc.error(request, {
        code: -32500,
        message: `not supported adress type: ${addressType}`,
      })
  }

  if (!address) {
    return openrpc.error(request, {
      code: -32500,
      message: 'missing address',
    })
  }

  if (!template) {
    return openrpc.error(request, {
      code: -32500,
      message: 'missing template',
    })
  }

  if (typeof template != 'string') {
    return openrpc.error(request, {
      code: -32500,
      message: 'template is not a string',
    })
  }

  if (!template.includes('{{nonce}}')) {
    return openrpc.error(request, {
      code: -32500,
      message: 'template missing nonce variable',
    })
  }

  if (!redirectUri) {
    return openrpc.error(request, {
      code: -32500,
      message: 'missing redirect URI',
    })
  }

  if (!scope) {
    return openrpc.error(request, {
      code: -32500,
      message: 'missing scope',
    })
  }

  if (!state) {
    return openrpc.error(request, {
      code: -32500,
      message: 'missing state',
    })
  }

  const nodeClient = context.get('node_client')
  try {
    const result = await nodeClient.getNonce({
      address,
      template,
      redirectUri,
      scope,
      state,
    })
    return openrpc.response(request, result)
  } catch (error) {
    return openrpc.error(request, {
      code: -32500,
      message: (error as Error).message,
    })
  }
}
