import * as openrpc from '@kubelt/openrpc'
import { RpcContext, RpcRequest, RpcService } from '@kubelt/openrpc'

import type { SetProfileParams } from '../../types'

export default async (
  service: Readonly<RpcService>,
  request: Readonly<RpcRequest>,
  context: Readonly<RpcContext>
) => {
  const [name, profile] = request.params as SetProfileParams
  const Account: DurableObjectNamespace = context.get('Account')
  const nodeClient = await openrpc.discover(Account, { name })
  const result = await nodeClient.setProfile({ profile })
  return openrpc.response(request, result)
}
