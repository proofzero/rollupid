import type { PlatformHeaders } from '@proofzero/platform-clients/base'
import createCoreClient from '@proofzero/platform-clients/core'

import { PlatformAddressURNHeader } from '@proofzero/types/headers'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'

import type { TraceSpan } from '@proofzero/platform-middleware/trace'

interface CoreClientOptions {
  context: {
    env: {
      Core: Fetcher
    }
    traceSpan: TraceSpan
  }
  jwt?: string
  addressURN?: string
}

export const getCoreClient = (options: CoreClientOptions) => {
  const {
    env: { Core },
    traceSpan,
  } = options.context
  const headers: PlatformHeaders = generateTraceContextHeaders(traceSpan)

  if (options.jwt) headers.Authorization = `Bearer ${options.jwt}`
  if (options.addressURN) headers[PlatformAddressURNHeader] = options.addressURN

  return createCoreClient(Core, headers)
}
