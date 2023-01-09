import { BaseMiddlewareFunction } from '@kubelt/platform-middleware/types'
import { Context } from '../../context'

import { NodeType } from '../../types'
import { isCryptoAddressType } from '../../utils'

export const checkCryptoNodes: BaseMiddlewareFunction<Context> = async ({
  next,
  ctx,
}) => {
  const nodeType = ctx.nodeType
  if (nodeType != NodeType.Crypto && nodeType != NodeType.Contract) {
    return await next({ ctx })
  }

  const addrType = ctx.addrType
  if (addrType && !isCryptoAddressType(addrType)) {
    throw `unsupported crypto address type: ${addrType}`
  }

  return await next({ ctx })
}
