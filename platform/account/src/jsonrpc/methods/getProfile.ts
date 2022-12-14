import * as openrpc from '@kubelt/openrpc'
import { RpcContext, RpcRequest, RpcService } from '@kubelt/openrpc'

import type { GetProfileParams } from '../../types'

export default async (
  service: Readonly<RpcService>,
  request: Readonly<RpcRequest>,
  context: Readonly<RpcContext>
) => {
  const [name] = request.params as GetProfileParams
  const Account: DurableObjectNamespace = context.get('Account')
  const nodeClient = await openrpc.discover(Account, { name })
  const result = await nodeClient.getProfile()
  return openrpc.response(request, result)
}
