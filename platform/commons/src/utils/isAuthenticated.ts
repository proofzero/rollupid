import { HEADER_CORE_AUTHENTICATION } from '../constants'
import { createFetcherJsonRpcClient } from '../jsonrpc'
import type { Api as AccountApi } from '../../../account/src/types'

export interface Environment {
  Account: Fetcher
}

export default async (request: Request, env: Environment): Promise<void> => {
  const { Account: Account } = env
  const authentication = request.headers.get(HEADER_CORE_AUTHENTICATION)
  if (!authentication) {
    throw 'not authenticated'
  }
  const client = createFetcherJsonRpcClient<AccountApi>(Account, {
    headers: {
      [HEADER_CORE_AUTHENTICATION]: authentication,
    },
  })

  if (!(await client.kb_isAuthenticated())) {
    throw 'not authenticated'
  }
}
