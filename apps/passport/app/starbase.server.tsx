import { createFetcherJsonRpcClient } from '@kubelt/platform.commons/src/jsonrpc'
import type { Func } from 'typed-json-rpc'
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
