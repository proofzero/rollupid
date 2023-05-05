import { TraceSpan } from '@proofzero/platform-middleware/trace'
import { AccountURN } from '@proofzero/urns/account'
import Env from '../../env'

export type ResolverContext = {
  env: Env
  jwt: string
  apiKey: string
  accountURN: AccountURN
  traceSpan: TraceSpan
  clientId: string
}
