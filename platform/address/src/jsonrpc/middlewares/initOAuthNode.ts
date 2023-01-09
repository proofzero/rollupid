import { BaseMiddlewareFunction } from '@kubelt/platform-middleware/types'
import { Context } from '../../context'
import { OAuthAddressProxyStub } from '../../nodes/oauth'
import { NodeType, OAuthAddressType } from '../../types'

export const initOAuthNode: BaseMiddlewareFunction<Context> = async ({
  next,
  ctx,
}) => {
  if (ctx.nodeType != NodeType.OAuth) {
    return next({ ctx })
  }

  const nodeClient = ctx.address as OAuthAddressProxyStub
  const addressURN = ctx.addressURN
  const addrType = ctx.addrType as OAuthAddressType
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
