import { createTRPCProxyClient, httpBatchLink, loggerLink } from '@trpc/client'
import { Router } from '@proofzero/types'
import { trpcClientLoggerGenerator } from './utils'
import { PlatformHeaders } from './base'

export default (fetcher: Fetcher, headers: PlatformHeaders) =>
  createTRPCProxyClient<Router.AddressRouter>({
    links: [
      loggerLink({
        logger: trpcClientLoggerGenerator('Address', headers),
      }),
      httpBatchLink({
        url: 'http://localhost/trpc',
        fetch: fetcher.fetch.bind(fetcher), // NOTE: preflight middleware?
        headers() {
          return headers || {}
        },
      }),
    ],
  })
