import { BaseMiddlewareFunction } from '@proofzero/platform-middleware/types'
import { AddressURNSpace } from '@proofzero/urns/address'
import { Context } from '../../context'
import { initAddressNodeByName } from '../../nodes'

export const setAddressNodeClient: BaseMiddlewareFunction<Context> = async ({
  next,
  ctx,
}) => {
  if (!ctx.addressURN) return next({ ctx })

  const node = initAddressNodeByName(
    AddressURNSpace.getBaseURN(ctx.addressURN),
    ctx.Address
  )

  return next({
    ctx: {
      ...ctx,
      address: node,
    },
  })
}
