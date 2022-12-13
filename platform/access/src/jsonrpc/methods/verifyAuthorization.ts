import { decodeJwt } from 'jose'

import * as openrpc from '@kubelt/openrpc'
import type { RpcContext, RpcRequest, RpcService } from '@kubelt/openrpc'

import { VerifyAuthorizationParams } from '../../types'

export default async (
  service: Readonly<RpcService>,
  request: Readonly<RpcRequest>,
  context: Readonly<RpcContext>
) => {
  const [token] = request.params as VerifyAuthorizationParams
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
  const result = await accessClient.verify({ token })
  return openrpc.response(request, result)
}
