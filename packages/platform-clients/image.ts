import { createTRPCProxyClient, httpBatchLink, loggerLink } from '@trpc/client'
import { Router } from '@kubelt/types'
import { trpcClientLoggerGenerator } from './utils'

export default (
  fetcher: Fetcher,
  options?: {
    cf?: RequestInitCfProperties
    headers?: Record<string, string>
  }
) =>
  createTRPCProxyClient<Router.ImageRouter>({
    links: [
      loggerLink({
        logger: trpcClientLoggerGenerator('Image'),
      }),
      httpBatchLink({
        url: 'http://localhost/trpc',
        fetch: (input, init?: RequestInit<RequestInitCfProperties>) => {
          defaultsDeep(init, options)
          return fetcher.fetch(input, init)
        }, // NOTE: preflight middleware?
      }),
    ],
  })
