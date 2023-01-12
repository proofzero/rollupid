import { AccountURN } from '@kubelt/urns/account'
import { BaseMiddlewareFunction } from './types'

export const Analytics: BaseMiddlewareFunction<{
  Analytics?: AnalyticsEngineDataset
  req?: Request
  accountURN?: AccountURN
}> = async ({ ctx, path, type, next }) => {
  const rayId = ctx.req?.headers.get('cf-ray') || null
  // if (!rayId) throw new Error('No CF-Ray found in request headers')

  // console.log('context', ctx)
  console.log('request', ctx.req)

  // const idx = JSON.stringify(ctx.req?.clone())
  // console.log('unique data in here?', idx)

  const hdrs = ctx.req?.headers
  for (const [key, value] of hdrs.entries()) {
    console.log('header', key, value)
  }

  // const bdy = JSON.stringify(await ctx.req?.clone().text())
  // console.log('unique data in body text?', bdy)

  const accountURN: string = ctx.accountURN || 'no account URN'

  // Pre-method call analytics.
  const pre: AnalyticsEngineDataPoint = {
    blobs: [ path, type, 'BEFORE', accountURN, rayId ],
    // doubles: [],
    indexes: [rayId], // TODO: Need a sampling index.
  }

  console.log('service precall analytics', JSON.stringify(pre))
  console.log(ctx.Analytics)
  ctx.Analytics?.writeDataPoint(pre)

  const result = await next({
    ctx,
  })

  // Post-method call analytics.
  const post: AnalyticsEngineDataPoint = {
    blobs: [ path, type, 'AFTER', accountURN, rayId ],
    // doubles: [],
    indexes: [rayId], // TODO: Need a sampling index.
  }

  console.log('service postcall analytics', JSON.stringify(post))
  ctx.Analytics?.writeDataPoint(post)

  return result
}
