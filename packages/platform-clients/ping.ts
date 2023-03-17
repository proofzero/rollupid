import { createTRPCProxyClient, httpBatchLink, loggerLink } from '@trpc/client'
import { Router } from '@proofzero/types'
import { trpcClientLoggerGenerator } from './utils'
import { PlatformHeaders } from './base'

export default (fetcher: Fetcher, headers: PlatformHeaders) =>
  createTRPCProxyClient<Router.PingRouter>({
    links: [
      loggerLink({
        logger: trpcClientLoggerGenerator('Ping', headers),
      }),
      httpBatchLink({
        url: 'http://localhost/trpc',
        fetch: fetcher.fetch,
        headers() {
          return headers || {}
        },
      }),
    ],
  })
