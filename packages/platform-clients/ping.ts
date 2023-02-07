import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import { Router } from '@kubelt/types'

export default (fetcher: Fetcher, headers?: Record<string, string>) =>
  createTRPCProxyClient<Router.PingRouter>({
    links: [
      httpBatchLink({
        url: 'http://localhost/trpc',
        fetch: fetcher.fetch,
        headers() {
          return headers || {}
        },
      }),
    ],
  })
