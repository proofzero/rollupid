import { createFetcherJsonRpcClient } from '@kubelt/platform.commons/src/jsonrpc'
import { ScopeMeta } from './components/authorization/Authorization'

interface StarbaseApi {
  [key: string]: Func
  kb_initPlatform(): Promise<string[]>
  kb_appScopes(): Promise<Record<string, ScopeMeta>>
}

export function getStabaseClient() {
  return createFetcherJsonRpcClient<StarbaseApi>(Starbase)
}
