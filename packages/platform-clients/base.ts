import type { Func } from 'typed-json-rpc'

export interface BaseApi {
  [key: string]: Func
}
