import { BaseMiddlewareFunction } from '@kubelt/platform-middleware/types'

import { Context } from '../../context'
import { NodeType } from '../../types.ts'
import { isOAuthAddressType } from '../../utils'

export const checkOAuthNode: BaseMiddlewareFunction<Context> = async ({
  next,
  ctx,
}) => {
  console.log('checkOAuthNode: nodeType', ctx.nodeType)
  if (ctx.nodeType && ctx.nodeType != NodeType.OAuth) {
    return next({ ctx })
  }

  const addrType = ctx.addrType

  console.log('checkOAuthNode: addrType', addrType)

  const nodeType = isOAuthAddressType(addrType)
  if (addrType && !nodeType) {
    throw `invalid oauth address type: ${addrType}`
  }

  return next({
    ctx: {
      ...ctx,
      nodeType,
    },
  })
}
