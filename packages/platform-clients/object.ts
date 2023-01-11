import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import { Router } from '@kubelt/types'
import { ClientOptions } from './types'

export default (fetcher: Fetcher, options?: ClientOptions) =>
  createTRPCProxyClient<Router.ObjectRouter>({
    links: [
      httpBatchLink({
        url: 'http://localhost/trpc',
        fetch: (...args) => fetcher.fetch(...args), // NOTE: preflight middleware?
        headers() {
          return options?.headers || {}
        },
      }),
    ],
  })
