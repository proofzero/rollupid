import ENSUtils from '@kubelt/platform-clients/ens-utils'
import { BaseMiddlewareFunction } from '@kubelt/platform-middleware/types'
import { Address } from '@kubelt/types'
import { AddressURNSpace } from '@kubelt/urns/address'
import { Context } from '../../context'

import { CryptoAddressType } from '../../types'

export const resolveENS: BaseMiddlewareFunction<Context> = async ({
  next,
  ctx,
}) => {
  if (
    ctx.addressURN &&
    (ctx.addrType == CryptoAddressType.Ethereum ||
      ctx.addrType == CryptoAddressType.ETH)
  ) {
    const ensClient = new ENSUtils()
    const response = await ensClient.getEnsEntry(
      AddressURNSpace.decode(ctx.addressURN)
    )

    return next({
      ctx: {
        ...ctx,
        name: response.address,
        addressDescription: response,
      },
    })
  }
  return next({ ctx })
}
