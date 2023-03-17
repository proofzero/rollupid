import { AccountURN } from '@proofzero/urns/account'
import { CustomAnalyticsFunctionType } from '@proofzero/platform-middleware/analytics'
import { TraceSpan } from '@proofzero/platform-middleware/trace'
export const GeoContext = 'com.kubelt.geo/location'

export type DeploymentMetadata = {
  name: string
  deployment: {
    id: string
    number: number
    timestamp: string
  }
}

type BaseContext = {
  req?: Request
  traceSpan?: TraceSpan
  Analytics?: AnalyticsEngineDataset
  ServiceDeploymentMetadata?: DeploymentMetadata
  CustomAnalyticsFunction?: CustomAnalyticsFunctionType
  token?: string
  accountURN?: AccountURN
  rparams?: URLSearchParams
  qparams?: URLSearchParams
  [GeoContext]?: IncomingRequestCfProperties<unknown>
}
export default BaseContext
