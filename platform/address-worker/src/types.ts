import { Func } from 'typed-json-rpc'

export interface Environment {
  Core: DurableObjectNamespace

  AUTH_JWT_ALG: string
  AUTH_JWT_TTL: string
  AUTH_NONCE_LENGTH: string
  AUTH_NONCE_TTL: string
}

export interface CoreApi {
  [key: string]: Func
  kb_setAddress: (address: string, coreId: string) => void
  kb_setName: (name: string, eth: string, coreId: string) => void
  kb_deleteAddress: () => void
  kb_resolveAddress: (address: string) => Promise<string>
}

export interface WorkerApi {
  [key: string]: Func
  kb_setAddress: (address: string, coreId: string) => void
  kb_unsetAddress: (address: string) => void
  kb_resolveAddress: (address: string) => string
}
