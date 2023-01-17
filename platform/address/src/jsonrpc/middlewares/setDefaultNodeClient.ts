import { BaseMiddlewareFunction } from '@kubelt/platform-middleware/types'
import { Context } from '../../context'
import { initAddressNodeByName } from '../../nodes'

export const setDefaultNodeClient: BaseMiddlewareFunction<Context> = async ({
  next,
  ctx,
}) => {
  if (!ctx.addressURN) {
    throw new Error('missing addressURN')
  }
  if (!ctx.address) {
    const node = await initAddressNodeByName(ctx.addressURN, ctx.DefaultAddress)
    return next({
      ctx: {
        ...ctx,
        address: node,
      },
    })
  }
  return next({ ctx })
}
