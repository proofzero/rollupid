import { NodeType } from '@kubelt/types/address'
import { BaseMiddlewareFunction } from '@kubelt/platform-middleware/types'
import { Context } from '../../context'
import { initContractNodeByName, initCryptoNodeByName } from '../../nodes'

export const setCryptoNodeClient: BaseMiddlewareFunction<Context> = async ({
  next,
  ctx,
}) => {
  if (!ctx.addressURN) {
    throw new Error('missing addressURN')
  }
  console.log('setCryptoNodeClient: nodeType', ctx.nodeType)
  if (ctx.nodeType == NodeType.Crypto) {
    const node = await initCryptoNodeByName(ctx.addressURN, ctx.CryptoAddress)
    return next({
      ctx: {
        ...ctx,
        address: node,
      },
    })
  }
  if (ctx.nodeType == NodeType.Contract) {
    const node = await initContractNodeByName(ctx.addressURN, ctx.CryptoAddress)
    return next({
      ctx: {
        ...ctx,
        address: node,
      },
    })
  }
  return next({ ctx })
}
