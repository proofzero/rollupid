import * as jose from 'jose'

import type { CryptoApi } from '@kubelt/platform.address/src/types'

import { createFetcherJsonRpcClient } from '../jsonrpc'
import { HEADER_CORE_ADDRESS, HEADER_ACCESS_TOKEN } from '../constants'

interface Environment {
  Address: Fetcher
}

export default async (request: Request, env: Environment): Promise<string> => {
  const { Address } = env
  const address = request.headers.get(HEADER_CORE_ADDRESS)
  if (address) {
    const client = createFetcherJsonRpcClient<CryptoApi>(Address)
    const coreId = await client.kb_resolveAddress(address)
    if (coreId) {
      return coreId
    }
  } else {
    const token = request.headers.get(HEADER_ACCESS_TOKEN)
    if (token) {
      const payload = jose.decodeJwt(token)
      if (payload.sub) {
        return payload.sub
      }
    }
  }

  throw 'address not found'
}
