import { BaseMiddlewareFunction } from '@kubelt/platform-middleware/types'
import { Context } from '../../context'

import { NodeType } from '@kubelt/types/address'
import { isCryptoAddressType } from '../../utils'

export const checkCryptoNodes: BaseMiddlewareFunction<Context> = async ({
  next,
  ctx,
}) => {
  const nodeType = ctx.nodeType
  console.log('checkCryptoNodes: nodeType', nodeType)
  if (nodeType != NodeType.Crypto && nodeType != NodeType.Contract) {
    return next({ ctx })
  }

  const addrType = ctx.addrType
  console.log('checkCryptoNodes: addrType', addrType)
  if (addrType && !isCryptoAddressType(addrType)) {
    throw `unsupported crypto address type: ${addrType}`
  }

  return next({ ctx })
}
