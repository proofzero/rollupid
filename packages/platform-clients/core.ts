import { createTRPCProxyClient, httpBatchLink, loggerLink } from '@trpc/client'
import type { CoreRouter } from '@proofzero/platform.core/src/router'

import { trpcClientLoggerGenerator } from './utils'
import { PlatformHeaders } from './base'

export default (fetcher: Fetcher, headers: PlatformHeaders) =>
  createTRPCProxyClient<CoreRouter>({
    links: [
      loggerLink({
        logger: trpcClientLoggerGenerator('Core', headers),
      }),
      httpBatchLink({
        url: 'http://localhost:10201/trpc',
        fetch: fetcher.fetch.bind(fetcher), // NOTE: preflight middleware?
        headers() {
          return headers || {}
        },
      }),
    ],
  })
