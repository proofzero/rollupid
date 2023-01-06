import { AccountURN } from '@kubelt/urns/account'
import { BaseMiddlewareFunction } from './types'

export const Analytics: BaseMiddlewareFunction<{
  Analytics?: AnalyticsEngineDataset
  req?: Request
  accountURN?: AccountURN
}> = async ({ ctx, path, type, next }) => {
  const rayId = ctx.req?.headers.get('Ray-ID')

  if (!rayId) throw new Error('No Ray-ID found in request headers')

  // analytics?.writeDataPoint({ blobs, doubles, indexes })

  // post your pre method call analytics

  const result = await next({
    ctx,
  })

  // post your post method call analytics

  return result
}
