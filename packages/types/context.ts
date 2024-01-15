import { IdentityURN } from '@proofzero/urns/identity'
import { TraceSpan } from '@proofzero/platform-middleware/trace'
export const GeoContext = 'com.kubelt.geo/location'

type BaseContext = {
  req?: Request
  traceSpan?: TraceSpan
  token?: string
  identityURN?: IdentityURN
  rparams?: URLSearchParams
  qparams?: URLSearchParams
  [GeoContext]?: IncomingRequestCfProperties<unknown>
}
export default BaseContext
