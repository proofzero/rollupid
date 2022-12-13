import * as openrpc from '@kubelt/openrpc'
import type { RpcContext, RpcRequest, RpcService } from '@kubelt/openrpc'

export default async (
  service: Readonly<RpcService>,
  request: Readonly<RpcRequest>,
  context: Readonly<RpcContext>
) => {
  const nodeClient = context.get('node_client')
  const result = await nodeClient.setProfile(request.params)
  return openrpc.response(request, result)
}
