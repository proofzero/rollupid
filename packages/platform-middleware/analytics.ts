import { PlatformJWTAssertionHeader } from '@kubelt/types/headers'
import { AccountURN } from '@kubelt/urns/account'
import { DeploymentMetadata } from '@kubelt/types'
import { BaseMiddlewareFunction } from './types'

export const Analytics: BaseMiddlewareFunction<{
  Analytics?: AnalyticsEngineDataset
  ServiceDeploymentMetadata?: DeploymentMetadata
  req?: Request
  accountURN?: AccountURN
}> = async ({ ctx, path, type, next }) => {
  const rayId = ctx.req?.headers.get('cf-ray') || null
  // if (!rayId) throw new Error('No CF-Ray found in request headers')
  console.log('rayId: ', rayId)

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
    ctx.req?.headers.get('kbt-access-jwt-assertion') ||
    rayId ||
    'no key'

  console.log('raw_key: ', raw_key)

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
    blobs: [
      service.name,
      service.deploymentId,
      service.deploymentNumber,
      service.deploymentTimestamp,
      path,
      type,
      'BEFORE',
      accountURN,
      rayId,
    ],
    // doubles: [],
    indexes: [hashkey],
  }

  ctx.Analytics?.writeDataPoint(pre)

  const result = await next({
    ctx,
  })

  // Post-method call analytics.
  const post: AnalyticsEngineDataPoint = {
    blobs: [
      service.name,
      service.deploymentId,
      service.deploymentNumber,
      service.deploymentTimestamp,
      path,
      type,
      'AFTER',
      accountURN,
      rayId,
    ],
    // doubles: [],
    indexes: [hashkey],
  }

  ctx.Analytics?.writeDataPoint(post)

  return result
}
