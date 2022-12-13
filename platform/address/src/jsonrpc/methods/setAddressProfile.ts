import * as openrpc from '@kubelt/openrpc'
import type { RpcContext, RpcRequest, RpcService } from '@kubelt/openrpc'

import { SetAddressProfileParams } from '../../types'

export default async (
  service: Readonly<RpcService>,
  request: Readonly<RpcRequest>,
  context: Readonly<RpcContext>
) => {
  const nodeClient = context.get('node_client')
  const [profile] = request.params as SetAddressProfileParams
  const result = await nodeClient.setProfile({ profile })
  return openrpc.response(request, result)
}
