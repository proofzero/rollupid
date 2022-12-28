import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import { AccountRouter } from '@kubelt/platform.account/src/jsonrpc/router'

export default (fetcher: Fetcher) =>
  createTRPCProxyClient<AccountRouter>({
    links: [
      httpBatchLink({
        url: 'http://localhost/trpc',
        fetch: fetcher.fetch,
      }),
    ],
  })
