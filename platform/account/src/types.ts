import { BaseApi } from '@kubelt/platform.commons/src/jsonrpc'

export interface Environment {
  Core: DurableObjectNamespace
}

export interface WorkerApi extends BaseApi {
  kb_getProfile(coreId: string): Promise<object>
  kb_setProfile(coreId: string, profile: object): Promise<boolean>
}
