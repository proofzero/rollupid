import { PlatformJWTAssertionHeader } from '@kubelt/types/headers'
import { AccountURN } from '@kubelt/urns/account'
import { BaseMiddlewareFunction } from './types'

export const Analytics: BaseMiddlewareFunction<{
  Analytics?: AnalyticsEngineDataset
  req?: Request
  accountURN?: AccountURN
}> = async ({ ctx, path, type, next }) => {
  const rayId = ctx.req?.headers.get('cf-ray') || null
  // if (!rayId) throw new Error('No CF-Ray found in request headers')

  const accountURN = ctx.accountURN || null

  const raw_key =
    rayId ||
    accountURN ||
    ctx.req?.headers.get(PlatformJWTAssertionHeader) ||
    'no key'
  const enc_key = new TextEncoder().encode(raw_key)
  const hash = await crypto.subtle.digest(
    {
      name: 'SHA-256',
    },
    enc_key
  )

  // Convert to a hex string.
  const hashkey = [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(-32)

  // Pre-method call analytics.
  const pre: AnalyticsEngineDataPoint = {
    blobs: [path, type, 'BEFORE', accountURN, rayId],
    // doubles: [],
    indexes: [hashkey], // TODO: Need a sampling index.
  }

  ctx.Analytics?.writeDataPoint(pre)

  const result = await next({
    ctx,
  })

  // Post-method call analytics.
  const post: AnalyticsEngineDataPoint = {
    blobs: [path, type, 'AFTER', accountURN, rayId],
    // doubles: [],
    indexes: [hashkey], // TODO: Need a sampling index.
  }

  ctx.Analytics?.writeDataPoint(post)

  return result
}
