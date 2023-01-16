import { AccountURN } from '@kubelt/urns/account'

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
  token?: string
  accountURN?: AccountURN
  rparams?: URLSearchParams
  qparams?: URLSearchParams
  [GeoContext]?: IncomingRequestCfProperties<unknown>
}
export default BaseContext
