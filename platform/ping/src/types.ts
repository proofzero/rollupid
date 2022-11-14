import { Func } from 'typed-json-rpc'

export interface Environment {
  Core: DurableObjectNamespace
  Address: Fetcher
}

export interface Api {
  [key: string]: Func
  kb_ping(): PingResult
  kb_pong(): PongResult
}

export type PingResult = 'pong'
export type PongResult = void
