import { BaseMiddlewareFunction } from '@kubelt/platform-middleware/types'

import { Context } from '../../context'
import { NodeType } from '../../types'
import { isOAuthAddressType } from '../../utils'

export const checkOAuthNode: BaseMiddlewareFunction<Context> = async ({
  next,
  ctx,
}) => {
  const nodeType = ctx.nodeType
  console.log('checkOAuthNode: nodeType', nodeType)
  if (nodeType && nodeType != NodeType.OAuth) {
    return next({ ctx })
  }

  const addrType = ctx.addrType

  console.log('checkOAuthNode: addrType', addrType)

  if (addrType && !isOAuthAddressType(addrType)) {
    throw `invalid oauth address type: ${addrType}`
  }

  return next({ ctx })
}
