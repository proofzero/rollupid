import { BaseApi } from '@kubelt/platform.commons/src/jsonrpc'
import { AccountURN } from '@kubelt/packages/urns/account'

export interface Environment {
  Core: DurableObjectNamespace
}
export interface WorkerApi extends BaseApi {
  kb_getProfile(accountURN: AccountURN): Promise<object>
  kb_setProfile(accountURN: AccountURN, profile: object): Promise<boolean>
}
