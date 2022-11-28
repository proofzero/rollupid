import { BaseURN } from 'urns'
import { BaseApi } from '@kubelt/platform.commons/src/jsonrpc'

export type AccountURN = BaseURN<'threeid', 'account'>

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
  kb_getProfile(coreId: string): Promise<object>
  kb_setProfile(coreId: string, profile: object): Promise<boolean>
}
