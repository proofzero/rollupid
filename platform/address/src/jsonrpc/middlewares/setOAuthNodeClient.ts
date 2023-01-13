import { NodeType } from '@kubelt/types/address'
import { BaseMiddlewareFunction } from '@kubelt/platform-middleware/types'
import { Context } from '../../context'
import { initOAuthNodeByName } from '../../nodes'

export const setOAuthNodeClient: BaseMiddlewareFunction<Context> = async ({
  next,
  ctx,
}) => {
  if (!ctx.addressURN) {
    throw new Error('missing addressURN')
  }
  if (ctx.nodeType == NodeType.OAuth) {
    const node = await initOAuthNodeByName(ctx.addressURN, ctx.OAuthAddress)
    console.debug("setOAUTHNODECLIENT middleware", ctx.addressURN, ctx.OAuthAddress)
    return next({
      ctx: {
        ...ctx,
        address: node,
      },
    })
  }
  return next({ ctx })
}
