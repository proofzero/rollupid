import { BaseMiddlewareFunction } from '@kubelt/platform-middleware/types'
import { Context } from '../../context'
import { NodeType } from '@kubelt/types/address'

export const initOAuthNode: BaseMiddlewareFunction<Context> = async ({
  next,
  ctx,
}) => {
  if (ctx.nodeType != NodeType.OAuth) {
    return next({ ctx })
  }

  const nodeClient = ctx.address
  const addressURN = ctx.addressURN
  const addrType = ctx.addrType
  if (!nodeClient) {
    throw new Error('missing node client')
  }

  if (!addressURN) {
    throw new Error('missing addressURN')
  }

  if (!addrType) {
    throw new Error('missing addrType')
  }

  const address = await nodeClient.class.getAddress()
  const type = await nodeClient.class.getType()

  if (!address || !type) {
    await nodeClient.class.setAddress(addressURN)
    await nodeClient.class.setType(addrType)
  }
  return next({ ctx })
}
