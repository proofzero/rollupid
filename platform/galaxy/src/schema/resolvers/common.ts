import { TraceSpan } from '@kubelt/platform-middleware/trace'
import { AccountURN } from '@kubelt/urns/account'
import Env from '../../env'

export type ResolverContext = {
  env: Env
  jwt: string
  apiKey: string
  accountURN: AccountURN
  traceSpan: TraceSpan
}
