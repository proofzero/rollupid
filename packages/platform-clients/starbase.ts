import type {
  AppCreateResult,
  AppProfileResult,
  AppScopesResult,
  AppAuthCheckParams,
  AppRotateSecretResult,
  AppClearSecretResult,
  AppAPIKeyValidityRequest,
  AppAPIKeyValidityResult,
} from '@kubelt/platform.starbase/src/types'

import { BaseApi } from './base'
import createClient from './fetcher'

export interface StarbaseApi extends BaseApi {
  kb_appList(): Promise<AppProfileResult[]>
  kb_appCreate(clientName: string): Promise<AppCreateResult>
  kb_appAuthCheck(params: AppAuthCheckParams): Promise<boolean>
  kb_appProfile(clientId: string): Promise<AppProfileResult>
  kb_appScopes(): Promise<AppScopesResult>
  kb_initPlatform(): Promise<string[]>
  kb_appClearSecret(clientId: string): Promise<AppClearSecretResult>
  kb_appRotateSecret(clientId: string): Promise<AppRotateSecretResult>
  kb_appApiKeyCheck(
    keyObj: AppAPIKeyValidityRequest
  ): Promise<AppAPIKeyValidityResult>
}

export default (
  fetcher: Fetcher,
  requestInit?: RequestInit<RequestInitCfProperties> | undefined
) => createClient<StarbaseApi>(fetcher, requestInit)
