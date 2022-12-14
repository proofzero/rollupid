import * as openrpc from '@kubelt/openrpc'
import type { RpcContext, RpcRequest, RpcService } from '@kubelt/openrpc'

import { AccessApi } from '@kubelt/platform-clients/access'
import { ResponseType } from '@kubelt/platform.access/src/types'

import { Challenge, CryptoAddressType, VerifyNonceParams } from '../../types'

export default async (
  service: Readonly<RpcService>,
  request: Readonly<RpcRequest>,
  context: Readonly<RpcContext>
) => {
  const addressType = context.get('addr_type')
  switch (addressType) {
    case CryptoAddressType.Ethereum:
    case CryptoAddressType.ETH:
      break
    default:
      return openrpc.error(request, {
        code: -32500,
        message: `kb_verifyNonce: not supported address type: ${addressType}`,
      })
  }

  const [nonce, signature] = request.params as VerifyNonceParams
  if (!nonce) {
    return openrpc.error(request, {
      code: -32500,
      message: 'missing nonce',
    })
  }
  if (!signature) {
    return openrpc.error(request, {
      code: -32500,
      message: 'missing signature',
    })
  }

  const nodeClient = context.get('node_client')
  const {
    address: clientId,
    redirectUri,
    scope,
    state,
  }: Challenge = await nodeClient.verifyNonce({ nonce, signature })

  const account = await nodeClient.resolveAccount()
  const responseType = ResponseType.Code

  const accessClient: AccessApi = context.get('Access')
  try {
    const result = await accessClient.kb_authorize(
      account,
      responseType,
      clientId,
      redirectUri,
      scope,
      state
    )

    return openrpc.response(request, result)
  } catch (error) {
    console.error(error)
    return openrpc.error(request, {
      code: -32500,
      message: (error as Error).message,
    })
  }
}
