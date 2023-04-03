import { createTRPCProxyClient, httpBatchLink, loggerLink } from '@trpc/client'
import { Router } from '@proofzero/types'
import { trpcClientLoggerGenerator } from './utils'
import { PlatformHeaders } from './base'
import { PlatformAddressURNHeader } from '@proofzero/types/headers'

export default (
  fetcher: Fetcher,
  headers: PlatformHeaders & { [PlatformAddressURNHeader]?: string }
) =>
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
