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
    // if (context.get('node_type') == NodeType.Crypto) {
    //   const core = Core.create()
    //   await core.start({ apiKey: context.get('APIKEY_MORALIS') })
    //   core.registerModules([Streams])

    //   const streamsApi = core.getModule<Streams>(Streams.moduleName)
    //   streamsApi.addAddress({
    //     address: context.get('name'),
    //     id: context.get('MORALIS_STREAM_ID'),
    //   })

    //   // and let's send a message to bootstrap the address collection
    //   context.get('BLOCKCHAIN_ACTIVITY').send({
    //     method: 'kb_indexTokens',
    //     body: [AddressURNSpace.urn(context.get('name')), 'eth', null],
    //   })
    //   context.get('BLOCKCHAIN_ACTIVITY').send({
    //     method: 'kb_indexTokens',
    //     body: [AddressURNSpace.urn(context.get('name')), 'polygon', null],
    //   })
    // }
  }

  const blobs = [await nodeClient.getAddress(), await nodeClient.getType()]
  const doubles: any[] = []
  const indexes = [blobs[0] ? blobs[0].slice(-32) : 'newCryptoCore'] // Must cap index at 32 bytes.

  context.get('AddressAnalytics').writeDataPoint({ blobs, doubles, indexes })
}
