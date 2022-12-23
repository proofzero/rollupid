import * as openrpc from '@kubelt/openrpc'
import type { RpcContext } from '@kubelt/openrpc'
import { NodeType } from '../../types'

export default async (request: Readonly<Request>, context: RpcContext) => {
  if (context.get('node_type') != NodeType.OAuth) {
    return
  }

  const OAuthAddress: DurableObjectNamespace = context.get('OAuthAddress')
  const name = context.get('name')
  const nodeClient = await openrpc.discover(OAuthAddress, { name })
  context.set('node_client', nodeClient)
}
