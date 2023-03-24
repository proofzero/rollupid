import createAccessClient from '@proofzero/platform-clients/access'
import createAddressClient from '@proofzero/platform-clients/address'
import createAccountClient from '@proofzero/platform-clients/account'
import createStarbaseClient from '@proofzero/platform-clients/starbase'

import { PlatformAddressURNHeader } from '@proofzero/types/headers'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'

import type { TraceSpan } from '@proofzero/platform-middleware/trace'

export function getStarbaseClient(jwt: string, env: Env, traceSpan: TraceSpan) {
  return createStarbaseClient(env.Starbase, {
    ...getAuthzHeaderConditionallyFromToken(jwt),
    ...generateTraceContextHeaders(traceSpan),
  })
}

export function getAccessClient(env: Env, traceSpan: TraceSpan, jwt?: string) {
  return createAccessClient(env.Access, {
    ...getAuthzHeaderConditionallyFromToken(jwt),
    ...generateTraceContextHeaders(traceSpan),
  })
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
