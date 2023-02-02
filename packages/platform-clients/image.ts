import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import { Router } from '@kubelt/types'
import { ClientOptions } from './types'

export default (fetcher: Fetcher, options?: ClientOptions) =>
  createTRPCProxyClient<Router.ImageRouter>({
    links: [
      httpBatchLink({
        url: 'http://localhost/trpc',
        fetch: fetcher.fetch.bind(fetcher), // NOTE: preflight middleware?
        headers() {
          return options?.headers || {}
        },
      }),
    ],
  })
