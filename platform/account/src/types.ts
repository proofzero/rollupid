import { BaseApi } from '@kubelt/platform.commons/src/jsonrpc'
import { AccountURN } from '@kubelt/packages/urns/account'

export interface Environment {
  Core: DurableObjectNamespace
  Oort: Fetcher
}

export interface OortApi {
  [key: string]: any
  kb_getObject(
    namespace: string,
    path: string
  ): Promise<{
    value: object
    version: number
  }>
}

export interface WorkerApi extends BaseApi {
  kb_getProfile(accountURN: AccountURN): Promise<object>
  kb_setProfile(accountURN: AccountURN, profile: object): Promise<boolean>
}
