import { createFetcherJsonRpcClient } from '@kubelt/platform.commons/src/jsonrpc'
import type { Api as AuthenticationApi } from '@kubelt/platform.account/src/types'
import type { Func, JsonRpcClient } from 'typed-json-rpc'
import type { ScopeMeta } from './components/authorization/Authorization'

interface StarbaseApi {
  [key: string]: Func
  kb_initPlatform(): Promise<string[]>
  kb_appScopes(): Promise<Record<string, ScopeMeta>>
  kbt_appProfile(): Promise<Record<string, any>>
}

export function getStabaseClient() {
  return createFetcherJsonRpcClient<StarbaseApi>(Starbase)
}

export const getAuthenticationClientWithAddress = (
  address: string
): JsonRpcClient<AuthenticationApi> => {
  return createFetcherJsonRpcClient<AuthenticationApi>(Account, {
    headers: {
      'KBT-Core-Address': address as string,
    },
  })
}
