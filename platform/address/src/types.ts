import type { BaseApi } from '@kubelt/platform.commons/src/jsonrpc'
import type { AuthorizeResult } from '@kubelt/platform.access/src/types'

export interface Environment {
  Access: Fetcher
  Core: DurableObjectNamespace
  Oort: Fetcher

  AUTH_JWT_ALG: string
  AUTH_JWT_TTL: string
  AUTH_NONCE_LENGTH: string
  AUTH_NONCE_TTL: string
}

export interface Challenge {
  nonce: string
  template: string
  clientId: string
  redirectUri: string
  scope: string[]
  state: string
}

export interface CoreApi extends BaseApi {
  kb_setAddress(address: string, coreId: string): void
  kb_deleteAddress(): void
  kb_resolveAddress(): Promise<string | undefined>
  kb_getNonce(
    template: string,
    clientId: string,
    redirectUri: string,
    scope: string[],
    state: string
  ): Promise<string>
  kb_verifyNonce(nonce: string, signature: string): Promise<Challenge>
}

export interface WorkerApi extends BaseApi {
  kb_setAddress(address: string, coreId: string): void
  kb_unsetAddress(address: string): void
  kb_resolveAddress(address: string): Promise<string | undefined>
  kb_getNonce(
    template: string,
    clientId: string,
    redirectUri: string,
    scope: string[],
    state: string
  ): Promise<string>
  kb_verifyNonce(
    address: string,
    nonce: string,
    signature: string
  ): Promise<AuthorizeResult>
}
