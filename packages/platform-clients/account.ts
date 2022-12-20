import type { AccountURN } from '@kubelt/urns/account'

import type { BaseApi } from './base'
import createClient from './fetcher'

export interface AccountApi extends BaseApi {
  kb_getProfile(account: AccountURN): object | undefined
  kb_setProfile(account: AccountURN, profile: object): void
}

export default (
  fetcher: Fetcher,
  requestInit?: RequestInit<RequestInitCfProperties> | undefined
) => createClient<AccountApi>(fetcher, requestInit)
