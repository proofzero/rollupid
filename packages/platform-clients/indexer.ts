import type { AccountURN } from '@kubelt/urns/account'

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
  kb_getGallery(account: AccountURN[]): object | undefined
}

export default (
  fetcher: Fetcher,
  requestInit?: RequestInit<RequestInitCfProperties> | undefined
) => createClient<IndexerApi>(fetcher, requestInit)
