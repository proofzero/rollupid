import type { AuthorizeResult, Scope } from '@kubelt/platform.access/src/types'
import type { AddressProfile } from '@kubelt/platform.address/src/types'

import type { AccountURN } from '@kubelt/urns/account'

import type { BaseApi } from './base'
import createClient from './fetcher'

export interface AddressApi extends BaseApi {
  kb_resolveAccount(): AccountURN
  kb_getAccount(): AccountURN
  kb_setAccount(account: AccountURN): void
  kb_unsetAccount(): void
  kb_getNonce(
    address: string,
    template: string,
    redirectUri: string,
    scope: Scope,
    state: string
  ): Promise<string>
  kb_verifyNonce(nonce: string, signature: string): AuthorizeResult
  kb_getAddressProfile(): AddressProfile | undefined
  kb_setAddressProfile(profile: Partial<AddressProfile>): void
  kb_getPfpVoucher(): object | undefined
}

export default (fetcher: Fetcher, requestInit: RequestInit | Request = {}) =>
  createClient<AddressApi>(fetcher, requestInit)
