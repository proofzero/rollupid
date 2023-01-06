import { AccountURN } from '@kubelt/urns/account'

export const GeoContext = 'com.kubelt.geo/location'

type BaseContext = {
  req?: Request
  Analytics?: AnalyticsEngineDataset
  token?: string
  accountURN?: AccountURN
  [GeoContext]?: IncomingRequestCfProperties<unknown>
}
export default BaseContext
