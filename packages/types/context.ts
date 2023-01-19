import { AccountURN } from '@kubelt/urns/account'
import { CustomAnalyticsFunctionType } from '@kubelt/platform-middleware/analytics'
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
