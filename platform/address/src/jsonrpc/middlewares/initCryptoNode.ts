import Moralis from 'moralis'

import type { RpcContext } from '@kubelt/openrpc'
import { NodeType } from '../../types'

export default async (request: Readonly<Request>, context: RpcContext) => {
  if (
    context.get('node_type') != NodeType.Crypto &&
    context.get('node_type') != NodeType.Contract
  ) {
    return
  }

  const nodeClient = context.get('node_client')
  if (!nodeClient) {
    return
  }

  const address = await nodeClient.getAddress()
  const type = await nodeClient.getType()

  if (!address || !type) {
    await nodeClient.setAddress({ address: context.get('name') })
    await nodeClient.setType({ type: context.get('addr_type') })

    // TODO: when contracts are supported we can monitor contracts too
    if (context.get('node_type') == NodeType.Crypto) {
      await Moralis.start({ apiKey: context.get('APIKEY_MORALIS') })
      await Moralis.Streams.addAddress({
        address: context.get('name'),
        id: context.get('MORALIS_STREAM_ID'),
      })
      // and let's set a short alarm to bootstrap itself
    }
  }
}
