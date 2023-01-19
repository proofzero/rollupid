import { PlatformJWTAssertionHeader } from '@kubelt/types/headers'
import { AccountURN } from '@kubelt/urns/account'
import { DeploymentMetadata } from '@kubelt/types'
import { BaseMiddlewareFunction } from './types'

export type CustomAnalyticsFunctionType = () => AnalyticsEngineDataPoint

export const Analytics: BaseMiddlewareFunction<{
  Analytics?: AnalyticsEngineDataset
  CustomAnalyticsFunction?: CustomAnalyticsFunctionType
  ServiceDeploymentMetadata?: DeploymentMetadata
  req?: Request
  accountURN?: AccountURN
}> = async ({ ctx, path, type, next }) => {
  const rayId = ctx.req?.headers.get('cf-ray') || null
  // if (!rayId) throw new Error('No CF-Ray found in request headers')
  // console.log('rayId: ', rayId)

  const service = {
    name: ctx.ServiceDeploymentMetadata?.name || 'unknown',
    deploymentId: ctx.ServiceDeploymentMetadata?.deployment?.id || 'unknown',
    deploymentNumber:
      String(ctx.ServiceDeploymentMetadata?.deployment?.number) || 'unknown',
    deploymentTimestamp:
      ctx.ServiceDeploymentMetadata?.deployment?.timestamp || 'unknown',
  }

  const accountURN = ctx.accountURN || null

  // TODO: Move to the types from the types package and parse JWT here for account URN.
  const raw_key =
    accountURN ||
    ctx.req?.headers.get(PlatformJWTAssertionHeader) ||
    rayId ||
    'no key'

  // // TODO: Bad perf. Only do this if there's no unique key.
  // const enc_key = new TextEncoder().encode(raw_key)
  // const hash = await crypto.subtle.digest(
  //   {
  //     name: 'SHA-256',
  //   },
  //   enc_key
  // )

  // // Convert to a hex string.
  // const hashkey = [...new Uint8Array(hash)]
  //   .map((b) => b.toString(16).padStart(2, '0'))
  //   .join('')
  //   .slice(-32)

  const customAnalytics = ctx.CustomAnalyticsFunction?.() || null

  // The custom analytics can override the defauly hashkey.
  const hashkey = customAnalytics?.indexes?.[0] || raw_key

  // Pre-method call analytics.
  const pre: AnalyticsEngineDataPoint = {
    blobs: [
      service.name,
      service.deploymentId,
      service.deploymentNumber,
      service.deploymentTimestamp,
      path,
      type,
      // 'BEFORE',
      accountURN,
      rayId,
      ...customAnalytics?.blobs || [], // The maximum allowed number of blobs is 20.
    ],
    doubles: [
      ...customAnalytics?.doubles || [], // The maximum allowed number of doubles is 20.
    ],
    indexes: [hashkey.slice(-32)], // Enforce 32 byte limit. The maximum number of indexes is 1.
  }

  // console.log('service precall analytics', JSON.stringify(pre))
  ctx.Analytics?.writeDataPoint(pre)

  const result = await next({
    ctx,
  })

  // Post-method call analytics. TODO: Probably remove.
  // const post: AnalyticsEngineDataPoint = {
  //   blobs: [
  //     service.name,
  //     service.deploymentId,
  //     service.deploymentNumber,
  //     service.deploymentTimestamp,
  //     path,
  //     type,
  //     'AFTER',
  //     accountURN,
  //     rayId,
  //     ...customAnalytics?.blobs || [], // The maximum allowed number of blobs is 20.
  //   ],
  //   doubles: [
  //     ...customAnalytics?.doubles || [], // The maximum allowed number of doubles is 20.
  //   ],
  //   indexes: [hashkey.slice(-32)],  // Enforce 32 byte limit. The maximum number of indexes is 1.
  // }

  // console.log('service postcall analytics', JSON.stringify(post))
  // ctx.Analytics?.writeDataPoint(post)

  return result
}
