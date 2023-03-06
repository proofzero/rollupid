import { AccountURN } from '@kubelt/urns/account'
import { CustomAnalyticsFunctionType } from '@kubelt/platform-middleware/analytics'
import { TraceSpan } from '@kubelt/platform-middleware/trace'
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
