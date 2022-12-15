import type { AccountURN } from '@kubelt/urns/account'

export interface Environment {
  Account: DurableObjectNamespace
}

export type GetProfileParams = [account: AccountURN]
export type SetProfileParams = [account: AccountURN, profile: object]
