import { PlatformJWTAssertionHeader } from '@kubelt/types/headers'
import { AccountURN } from '@kubelt/urns/account'
import { DeploymentMetadata } from '@kubelt/types'
import { BaseMiddlewareFunction } from './types'

export const Analytics: BaseMiddlewareFunction<{
  Analytics?: AnalyticsEngineDataset
  ServiceDeploymentMetadata?: DeploymentMetadata
  req?: Request
  accountURN?: AccountURN
}> = async ({ ctx, path, type, next }) => { //resHeaders, 
  const rayId = ctx.req?.headers.get('cf-ray') || null
  // if (!rayId) throw new Error('No CF-Ray found in request headers')

  console.log('testing1', ctx.Analytics ? 'Analytics' : 'no analytics binding')
  console.log('testing2', ctx.ServiceDeploymentMetadata ? 'ServiceMetadata' : 'no metadata binding')

  // TODO: Activity-specific custom object tracking per-method (new middleware).

  const accountURN = ctx.accountURN || null

  // TODO: Move to the types from the types package and parse JWT here for account URN.
  const raw_key =
    accountURN ||
    ctx.req?.headers.get(PlatformJWTAssertionHeader) ||
    ctx.req?.headers.get('kbt-access-jwt-assertion') ||
    rayId ||
    'no key'
  const enc_key = new TextEncoder().encode(raw_key)

  // TODO: Bad perf. Only do this if there's no unique key.
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
