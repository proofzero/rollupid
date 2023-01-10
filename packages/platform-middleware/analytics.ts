import { AccountURN } from '@kubelt/urns/account'
import { BaseMiddlewareFunction } from './types'

export const Analytics: BaseMiddlewareFunction<{
  Analytics?: AnalyticsEngineDataset
  req?: Request
  accountURN?: AccountURN
}> = async ({ ctx, path, type, next }) => {
  const rayId = ctx.req?.headers.get('Ray-ID') || null
  // if (!rayId) throw new Error('No Ray-ID found in request headers')

  const accountURN: string = ctx.accountURN || 'no account URN'

  // Pre-method call analytics.
  const pre: AnalyticsEngineDataPoint = {
    blobs: [ path, type, 'BEFORE', accountURN, rayId ],
    // doubles: [],
    indexes: [rayId],
  }

  console.log('service precall analytics', JSON.stringify(pre))
  ctx.Analytics?.writeDataPoint(pre)

  const result = await next({
    ctx,
  })

  // Post-method call analytics.
  const post: AnalyticsEngineDataPoint = {
    blobs: [ path, type, 'AFTER', accountURN, rayId ],
    // doubles: [],
    indexes: [rayId],
  }

  console.log('service postcall analytics', JSON.stringify(post))
  ctx.Analytics?.writeDataPoint(post)

  return result
}
