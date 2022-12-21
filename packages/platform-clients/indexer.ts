import type { AccountURN } from '@kubelt/urns/account'

import type { BaseApi } from './base'
import createClient from './fetcher'

export interface IndexerApi extends BaseApi {
  kb_setGallery(account: AccountURN): void
  kb_getGallery(
    account: AccountURN,
    gallery: {
      tokenId: string
      contract: string
      addressURN: string
      gallery_order: number
    }
  ): object | undefined
}

export default (
  fetcher: Fetcher,
  requestInit?: RequestInit<RequestInitCfProperties> | undefined
) => createClient<IndexerApi>(fetcher, requestInit)
