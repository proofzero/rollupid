import { Func } from 'typed-json-rpc'

export interface Environment {
  Core: DurableObjectNamespace
}

export interface CoreApi {
  [key: string]: Func
  kb_setAddress: (address: string, type: string, coreId: string) => void
  kb_unsetAddress: () => void
  kb_resolveAddress: () => Promise<string | null>
}

export interface WorkerApi {
  [key: string]: Func
  kb_setAddress: (address: string, type: string, coreId: string) => void
  kb_unsetAddress: (address: string) => void
  kb_resolveAddress: (address: string) => string | null
}
