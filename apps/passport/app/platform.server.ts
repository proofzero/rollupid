import createAccessClient from '@kubelt/platform-clients/access'
import createAddressClient from '@kubelt/platform-clients/address'
import createAccountClient from '@kubelt/platform-clients/account'
import createStarbaseClient from '@kubelt/platform-clients/starbase'

import { PlatformAddressURNHeader } from '@kubelt/types/headers'
import { getAuthzHeaderConditionallyFromToken } from '@kubelt/utils'
import {
  generateTraceContextHeaders,
  TraceSpan,
} from '@kubelt/platform-middleware/trace'

export function getStarbaseClient(jwt: string, env: Env, traceSpan: TraceSpan) {
  return createStarbaseClient(env.Starbase, {
    ...getAuthzHeaderConditionallyFromToken(jwt),
    ...generateTraceContextHeaders(traceSpan),
  })
}

export function getAccessClient(env: Env, traceSpan: TraceSpan) {
  return createAccessClient(env.Access, generateTraceContextHeaders(traceSpan))
}

export function getAddressClient(
  addressUrn: string,
  env: Env,
  traceSpan: TraceSpan
) {
  return createAddressClient(env.Address, {
    [PlatformAddressURNHeader]: addressUrn,
    ...generateTraceContextHeaders(traceSpan),
  })
}

export function getAccountClient(jwt: string, env: Env, traceSpan: TraceSpan) {
  return createAccountClient(env.Account, {
    ...getAuthzHeaderConditionallyFromToken(jwt),
    ...generateTraceContextHeaders(traceSpan),
  })
}
