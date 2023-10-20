import { IdentityURN } from '@proofzero/urns/identity'
import { DeploymentMetadata } from '@proofzero/types'
import { WriteAnalyticsDataPoint } from '@proofzero/platform-clients/analytics'

import { BaseMiddlewareFunction } from './types'

export type CustomAnalyticsFunctionType = () => AnalyticsEngineDataPoint

export const Analytics: BaseMiddlewareFunction<{
  Analytics?: AnalyticsEngineDataset
  CustomAnalyticsFunction?: CustomAnalyticsFunctionType
  ServiceDeploymentMetadata?: DeploymentMetadata
  env: {
    Analytics?: AnalyticsEngineDataset
    ServiceDeploymentMetadata?: DeploymentMetadata
  }
  req?: Request
  identityURN?: IdentityURN
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
