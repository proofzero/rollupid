import { AccountURN } from '@proofzero/urns/account'
import { DeploymentMetadata } from '@proofzero/types'
import { BaseMiddlewareFunction } from './types'
import { WriteAnalyticsDataPoint } from '@proofzero/platform-clients/analytics'

export type CustomAnalyticsFunctionType = () => AnalyticsEngineDataPoint

export const Analytics: BaseMiddlewareFunction<{
  Analytics?: AnalyticsEngineDataset
  CustomAnalyticsFunction?: CustomAnalyticsFunctionType
  ServiceDeploymentMetadata?: DeploymentMetadata
  req?: Request
  accountURN?: AccountURN
}> = async ({ ctx, path, type, next }) => {
  WriteAnalyticsDataPoint({
    ...ctx,
    path,
    type,
  })

  return await next({
    ctx,
  })
}
