import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import { ClientOptions } from './types'
import { Router } from '@kubelt/types'

export default (fetcher: Fetcher, options?: ClientOptions) =>
  createTRPCProxyClient<Router.IndexerRouter>({
    links: [
      httpBatchLink({
        url: 'http://localhost/trpc',
        fetch: fetcher.fetch.bind(fetcher), // NOTE: preflight middleware?,
        headers() {
          return options?.headers || {}
        },
      }),
    ],
  })
