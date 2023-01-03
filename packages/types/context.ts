export const GeoContext = 'com.kubelt.geo/location'

type BaseContext = {
  token?: string
  [GeoContext]?: IncomingRequestCfProperties<unknown>
}
export default BaseContext
