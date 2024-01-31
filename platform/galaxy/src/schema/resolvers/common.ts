import { TraceSpan } from '@proofzero/platform-middleware/trace'
import { IdentityURN } from '@proofzero/urns/identity'
import Env from '../../env'

export type ResolverContext = {
  env: Env
  jwt: string
  apiKey: string
  identityURN: IdentityURN
  traceSpan: TraceSpan
  clientId: string
}
