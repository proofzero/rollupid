import type { AddressURN } from '@kubelt/urns/address'
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import { ClientOptions } from './types'
import type { BaseApi } from './base'
import { Router } from '@kubelt/types'

type TokenRecord = {
  tokenId: string
  contract: string
  addressURN: string
  gallery_order: number
}

export interface IndexerApi extends BaseApi {
  kb_setGallery(gallery: TokenRecord[]): void
  kb_getGallery(addresses: AddressURN[]): object | undefined
}

export default (fetcher: Fetcher, options?: ClientOptions) =>
  createTRPCProxyClient<Router.IndexerRouter>({
    links: [
      httpBatchLink({
        url: 'http://localhost/trpc',
        fetch: fetcher.fetch,
        headers() {
          return options?.headers || {}
        },
      }),
    ],
  })
