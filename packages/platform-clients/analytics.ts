import { BaseContext } from '@kubelt/types'
import { AccountURN, AccountURNSpace } from '@kubelt/urns/account'
import { getAuthzTokenFromReq } from '@kubelt/utils'
import { decodeJwt } from 'jose'
type PathContext = { path?: string; type?: string } & BaseContext

export const WriteAnalyticsDataPoint = (
  ctx: PathContext,
  customDatapoint?: AnalyticsEngineDataPoint,
  customDataset?: AnalyticsEngineDataset
) => {
  const rayId = ctx.req?.headers.get('cf-ray') || null

  const service = {
    name: ctx.ServiceDeploymentMetadata?.name || 'unknown',
    deploymentId: ctx.ServiceDeploymentMetadata?.deployment?.id || 'unknown',
    deploymentNumber:
      String(ctx.ServiceDeploymentMetadata?.deployment?.number) || 'unknown',
    deploymentTimestamp:
      ctx.ServiceDeploymentMetadata?.deployment?.timestamp || 'unknown',
  }

  const account = ctx.accountURN
    ? AccountURNSpace.componentizedParse(ctx.accountURN).decoded
    : null
  const token = ctx.req ? getAuthzTokenFromReq(ctx.req) : null
  const sub = token ? (decodeJwt(token).sub as AccountURN) : null
  const subAcct = sub ? AccountURNSpace.componentizedParse(sub).decoded : null

  // TODO: Move to the types from the types package and parse JWT here for account URN.
  const raw_key = account || subAcct || rayId || null

  const customAnalytics =
    customDatapoint ||
    ctx.CustomAnalyticsFunction?.() ||
    ({} as AnalyticsEngineDataPoint)

  // The custom analytics can override the defauly hashkey.
  const formattedIndexes =
    customAnalytics?.indexes?.map(
      (i) => (i ? i.slice(-32) : null) // Enforce 32 byte limit. The maximum number of indexes is 1.
    ) || []
  formattedIndexes.unshift(raw_key) // The first index is the hashkey.

  const blobs = [
    service.name,
    service.deploymentId,
    service.deploymentNumber,
    service.deploymentTimestamp,
    ctx?.path ? ctx.path : 'unknown',
    ctx?.type ? ctx.type : 'unknown',
    // 'AFTER',
    account,
    rayId,
    ...(customAnalytics.blobs || []),
  ].slice(0, 20) // The maximum allowed number of blobs is 20.

  // The total length of blobs must be less than 5120 bytes.
  while (blobs.length > 0 && blobs.join('').length > 5120) {
    blobs.pop()
  }

  const point: AnalyticsEngineDataPoint = {
    blobs,
    doubles: [...(customAnalytics?.doubles || [])].slice(0, 20), // The maximum allowed number of doubles is 20.
    indexes: formattedIndexes,
  }

  console.log('service analytics', JSON.stringify(point))

  // Allow the caller to specify a custom dataset.
  const dataset = customDataset ? customDataset : ctx.Analytics
  dataset?.writeDataPoint(point)
}
