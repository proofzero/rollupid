import * as jose from 'jose'

import { CoreWorkerEnvironment } from '../routers/core'
import { createFetcherJsonRpcClient } from '../jsonrpc'

import type { WorkerApi } from '@kubelt/address-worker/src/types'

export default async (
  request: Request,
  env: CoreWorkerEnvironment
): Promise<DurableObjectId | null> => {
  const { Address, Core } = env
  const address = request.headers.get('KBT-Core-Address')
  if (address) {
    const client = createFetcherJsonRpcClient<WorkerApi>(Address)
    const coreId = await client.kb_resolveAddress(address)
    if (coreId) {
      return Core.idFromString(coreId)
    }
  } else {
    const authentication = request.headers.get('KBT-Access-JWT-Assertion')
    if (authentication) {
      const payload = jose.decodeJwt(authentication)
      if (payload.iss) {
        return Core.idFromString(payload.iss)
      }
    }
  }

  return null
}
