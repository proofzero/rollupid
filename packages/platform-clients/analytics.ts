import { BaseContext } from '@proofzero/types'
import { AccountURN, AccountURNSpace } from '@proofzero/urns/account'
import { getAuthzTokenFromReq } from '@proofzero/utils'
import { decodeJwt } from 'jose'
type PathContext = { path?: string; type?: string } & BaseContext

export const WriteAnalyticsDataPoint = (
  ctx: PathContext,
  customDatapoint?: AnalyticsEngineDataPoint,
  customDataset?: AnalyticsEngineDataset
) => {
  const cohortId = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    timeZone: 'America/New_York',
  }) // just the MM/YYYY part

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
  const raw_key = account || subAcct || null

  const customAnalytics =
    customDatapoint ||
    ctx.CustomAnalyticsFunction?.() ||
    ({} as AnalyticsEngineDataPoint)

  // The custom analytics can override the defauly hashkey.
  const hashkey = customAnalytics?.indexes?.[0] || raw_key

  const blobs = [
    service.name,
    service.deploymentId,
    service.deploymentNumber,
    service.deploymentTimestamp,
    ctx?.path ? ctx.path : 'unknown',
    ctx?.type ? ctx.type : 'unknown',
    // 'AFTER',
    account,
    cohortId,
    ...(customAnalytics.blobs || []),
  ].slice(0, 20) // The maximum allowed number of blobs is 20.

  // The total length of blobs must be less than 5120 bytes.
  while (blobs.length > 0 && blobs.join('').length > 5120) {
    blobs.pop()
  }

  const point: AnalyticsEngineDataPoint = {
    blobs,
    doubles: [...(customAnalytics?.doubles || [])].slice(0, 20), // The maximum allowed number of doubles is 20.
    indexes: hashkey ? [hashkey.slice(-32)] : [], // Enforce 32 byte limit. The maximum number of indexes is 1.
  }

  // Allow the caller to specify a custom dataset.
  const dataset = customDataset ? customDataset : ctx.Analytics
  dataset?.writeDataPoint(point)
}
