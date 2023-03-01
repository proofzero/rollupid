import { createTRPCProxyClient, httpBatchLink, loggerLink } from '@trpc/client'
import { Router } from '@kubelt/types'
import { trpcClientLoggerGenerator } from './utils'

export default (fetcher: Fetcher, headers?: Record<string, string>) =>
  createTRPCProxyClient<Router.PingRouter>({
    links: [
      loggerLink({
        logger: trpcClientLoggerGenerator('Ping'),
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
