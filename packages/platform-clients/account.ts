import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import { AccountRouter } from '@kubelt/platform.account/src/jsonrpc/router'
import { ClientOptions } from './types'

export default (fetcher: Fetcher, options?: ClientOptions) =>
  createTRPCProxyClient<AccountRouter>({
    links: [
      httpBatchLink({
        url: 'http://localhost/trpc',
        fetch: fetcher.fetch,
        headers() {
          return options?.headers || { foo: 'bar' }
        },
      }),
    ],
  })
