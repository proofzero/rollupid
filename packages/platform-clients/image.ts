import { createTRPCProxyClient, httpBatchLink, loggerLink } from '@trpc/client'
import { Router } from '@kubelt/types'
import { trpcClientLoggerGenerator } from './utils'
import { PlatformHeaders } from './base'

export default (
  fetcher: Fetcher,
  options: {
    imagesURL?: string
    headers: PlatformHeaders
  }
) =>
  createTRPCProxyClient<Router.ImageRouter>({
    links: [
      loggerLink({
        logger: trpcClientLoggerGenerator('Image', options.headers),
      }),
      httpBatchLink({
        url: options?.imagesURL || 'http://localhost/trpc',
        fetch: fetcher.fetch.bind(fetcher), // NOTE: preflight middleware?
        headers() {
          return options?.headers || {}
        },
      }),
    ],
  })
