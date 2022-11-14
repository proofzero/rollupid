import * as jose from 'jose'

import type { WorkerApi } from '../../../address/src/types'

import { createFetcherJsonRpcClient } from '../jsonrpc'

interface Environment {
  Address: Fetcher
}

export default async (
  request: Request,
  env: Environment
): Promise<string | null> => {
  const { Address } = env
  const address = request.headers.get('KBT-Core-Address')
  if (address) {
    const client = createFetcherJsonRpcClient<WorkerApi>(Address)
    const coreId = await client.kb_resolveAddress(address)
    if (coreId) {
      return coreId
    }
  } else {
    const authentication = request.headers.get('KBT-Access-JWT-Assertion')
    if (authentication) {
      const payload = jose.decodeJwt(authentication)
      if (payload.iss) {
        return payload.iss
      }
    }
  }

  return null
}
