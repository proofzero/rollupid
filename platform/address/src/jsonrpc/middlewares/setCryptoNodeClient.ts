import * as openrpc from '@kubelt/openrpc'
import type { RpcContext } from '@kubelt/openrpc'
import { NodeType } from '../../types'

export default async (request: Readonly<Request>, context: RpcContext) => {
  if (context.get('node_type') == NodeType.Crypto) {
    const CryptoAddress: DurableObjectNamespace = context.get('CryptoAddress')
    const name = context.get('name')
    const nodeClient = await openrpc.discover(CryptoAddress, { name })
    context.set('node_client', nodeClient)
    return
  }
  if (context.get('node_type') == NodeType.Contract) {
    const ContractAddress: DurableObjectNamespace =
      context.get('ContractAddress')
    const name = context.get('name')
    const nodeClient = await openrpc.discover(ContractAddress, { name })
    context.set('node_client', nodeClient)
    return
  }
}
