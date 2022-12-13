import * as openrpc from '@kubelt/openrpc'
import type { RpcContext, RpcRequest, RpcService } from '@kubelt/openrpc'

import { SetAccountParams } from '../../types'

export default async (
  service: Readonly<RpcService>,
  request: Readonly<RpcRequest>,
  context: Readonly<RpcContext>
) => {
  const nodeClient = context.get('node_client')
  const [account] = request.params as SetAccountParams
  await nodeClient.setAccount({ account })
  return openrpc.response(request, null)
}
