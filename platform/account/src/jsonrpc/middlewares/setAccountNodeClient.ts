import { BaseMiddlewareFunction } from '@proofzero/platform-middleware/types'
import { AccountURNSpace } from '@proofzero/urns/account'
import { Context } from '../../context'
import { initAccountNodeByName } from '../../nodes'

export const setAccountNodeClient: BaseMiddlewareFunction<Context> = async ({
  next,
  ctx,
}) => {
  if (!ctx.accountURN) return next({ ctx })

  const node = initAccountNodeByName(
    AccountURNSpace.getBaseURN(ctx.accountURN),
    ctx.env.Account
  )

  return next({
    ctx: {
      ...ctx,
      account: node,
    },
  })
}
