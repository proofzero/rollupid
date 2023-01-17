import { BaseMiddlewareFunction } from '@kubelt/platform-middleware/types'
import { Context } from '../../context'
import { initAddressNodeByName } from '../../nodes'

export const setAddressNodeClient: BaseMiddlewareFunction<Context> = async ({
  next,
  ctx,
}) => {
  if (!ctx.addressURN) {
    throw new Error('missing addressURN')
  }

  const node = initAddressNodeByName(ctx.addressURN, ctx.Address)
  return next({
    ctx: {
      ...ctx,
      address: node,
    },
  })
}
