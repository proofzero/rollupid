import { HEADER_CORE_AUTHENTICATION } from '../constants'
import { createFetcherJsonRpcClient } from '../jsonrpc'
import type { Api as PassportApi } from '@kubelt/passport-worker/src/types'

export interface Environment {
  Passport: Fetcher
}

export default async (request: Request, env: Environment): Promise<void> => {
  const { Passport } = env
  const authentication = request.headers.get(HEADER_CORE_AUTHENTICATION)
  if (!authentication) {
    throw 'not authenticated'
  }
  const client = createFetcherJsonRpcClient<PassportApi>(Passport, {
    headers: {
      [HEADER_CORE_AUTHENTICATION]: authentication,
    },
  })

  if (!(await client.kb_isAuthenticated())) {
    throw 'not authenticated'
  }
}
