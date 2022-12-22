import type { AddressURN } from '@kubelt/urns/address'

import type { BaseApi } from './base'
import createClient from './fetcher'

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

export default (
  fetcher: Fetcher,
  requestInit?: RequestInit<RequestInitCfProperties> | undefined
) => createClient<IndexerApi>(fetcher, requestInit)
