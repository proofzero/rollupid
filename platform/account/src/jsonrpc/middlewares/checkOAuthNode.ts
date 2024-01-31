import { BaseMiddlewareFunction } from '@proofzero/platform-middleware/types'
import { NodeType } from '@proofzero/types/account'

import { Context } from '../../context'
import { isOAuthAccountType } from '../../utils'

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

  const nodeType = isOAuthAccountType(addrType)
  if (nodeType) {
    return next({
      ctx: {
        ...ctx,
        nodeType,
      },
    })
  } else {
    return next({ ctx })
  }
}
