import { createTRPCProxyClient, httpBatchLink, loggerLink } from '@trpc/client'
import { Router } from '@kubelt/types'
import { trpcClientLoggerGenerator } from './utils'

export default (fetcher: Fetcher, headers?: Record<string, string>) =>
  createTRPCProxyClient<Router.ObjectRouter>({
    links: [
      loggerLink({
        logger: trpcClientLoggerGenerator('Object'),
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
