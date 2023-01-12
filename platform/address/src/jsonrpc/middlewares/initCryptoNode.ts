import { BaseMiddlewareFunction } from '@kubelt/platform-middleware/types'
import { Context } from '../../context'
import { NodeType } from '@kubelt/types/address'

export const initCryptoNode: BaseMiddlewareFunction<Context> = async ({
  next,
  ctx,
}) => {
  console.log('initCryptoNode: ctx.nodeType', ctx.nodeType)
  if (ctx.nodeType != NodeType.Crypto) {
    return next({ ctx })
  }

  const addressNode = ctx.address
  const addressURN = ctx.addressURN
  const addrType = ctx.addrType
  if (!addressNode) {
    throw new Error('missing address node')
  }
  if (!addressURN) {
    throw new Error('missing addressURN')
  }
  if (!addrType) {
    throw new Error('missing addrType')
  }

  const address = await addressNode.class.getAddress()
  const type = await addressNode.class.getType()

  if (!address || !type) {
    await addressNode.class.setAddress(addressURN)
    await addressNode.class.setType(addrType)

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
  console.log('initCryptoNode: address', address)
  return next({ ctx })
}
