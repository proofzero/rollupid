import { TRACEPARENT_HEADER_NAME } from '@proofzero/platform-middleware/trace'
import type { Func } from 'typed-json-rpc'

export interface BaseApi {
  [key: string]: Func
}

export type RequiredPlatformHeaders = {
  [TRACEPARENT_HEADER_NAME]: string
}

export type PlatformHeaders = Record<string, string> & RequiredPlatformHeaders
