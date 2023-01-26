import { BaseMiddlewareFunction } from '@kubelt/platform-middleware/types'
import { AddressURNSpace } from '@kubelt/urns/address'
import { Context } from '../../context'
import { initAddressNodeByName } from '../../nodes'

export const setAddressNodeClient: BaseMiddlewareFunction<Context> = async ({
  next,
  ctx,
}) => {
  if (!ctx.addressURN) {
    throw new Error('missing addressURN')
  }

  const baseUrn = AddressURNSpace.getBaseURN(ctx.addressURN)
  const node = initAddressNodeByName(baseUrn, ctx.Address)
  return next({
    ctx: {
      ...ctx,
      address: node,
    },
  })
}
