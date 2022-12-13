import { createFetcherJsonRpcClient } from '@kubelt/platform.commons/src/jsonrpc'
import type { Func } from 'typed-json-rpc'

interface StarbaseApi {
  [key: string]: Func
  kb_initPlatform(): Promise<string[]>
  kbt_appProfile(): Promise<Record<string, any>>
}

export function getStarbaseClient() {
  return createFetcherJsonRpcClient<StarbaseApi>(Starbase)
}
