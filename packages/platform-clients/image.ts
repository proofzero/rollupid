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
        url: 'https://images-dev.rollup.id/trpc',
        fetch: (input, init?: RequestInit<RequestInitCfProperties>) => {
          if (init && options?.cf) {
            init.cf = options.cf
          }
          console.debug({ options })
          return fetcher.fetch(input, init)
        }, // NOTE: preflight middleware?
      }),
    ],
  })
