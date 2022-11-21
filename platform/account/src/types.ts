import { BaseApi } from '@kubelt/platform.commons/src/jsonrpc'
import type { AuthorizeResult } from '@kubelt/platform.access/src/types'

export interface Environment {
  Address: Fetcher
  Access: Fetcher
  Core: DurableObjectNamespace
}

export interface Challenge {
  address: string
  nonce: string
  template: string
  clientId: string
  redirectUri: string
  scope: string[]
  state: string
}

export interface WorkerApi extends BaseApi {
  kb_getNonce(
    address: string,
    template: string,
    clientId: string,
    redirectUri: string,
    scope: string[],
    state: string
  ): Promise<string>
  kb_verifyNonce(nonce: string, signature: string): Promise<AuthorizeResult>
}

export interface CoreApi extends BaseApi {
  getNonce(
    address: string,
    template: string,
    clientId: string,
    redirectUri: string,
    scope: string[],
    state: string
  ): Promise<string>
  verifyNonce(nonce: string, signature: string): Promise<Challenge>
}
