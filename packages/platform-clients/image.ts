import { createTRPCProxyClient, httpBatchLink, loggerLink } from '@trpc/client'
import { Router } from '@kubelt/types'
import { trpcClientLoggerGenerator } from './utils'

export default (
  fetcher: Fetcher,
  options?: {
    imagesURL?: string
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
        url: options?.imagesURL || 'http://localhost/trpc',
        fetch: (input, init?: RequestInit<RequestInitCfProperties>) => {
          if (init && options?.cf) {
            init.cf = options.cf
          }
          return fetcher.fetch(input, init)
        }, // NOTE: preflight middleware?
      }),
    ],
  })
