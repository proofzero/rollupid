import {
  fetchRequestHandler,
  FetchCreateContextFnOptions,
} from '@trpc/server/adapters/fetch'
// import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/next'

import { serverOnError as onError } from '@proofzero/utils/trpc'

import { createContext } from './context'
import { appRouter } from './jsonrpc/router'
import Address from './nodes/address'
import CryptoAddress from './nodes/crypto'
import ContractAddress from './nodes/contract'
import OAuthAddress from './nodes/oauth'
import type { Environment } from './types'

export default {
  async fetch(request: Request, env: Environment): Promise<Response> {
    return fetchRequestHandler({
      endpoint: '/trpc',
      req: request,
      router: appRouter,
      onError,
      createContext: (opts) =>
        createContext(opts as FetchCreateContextFnOptions, env),
    })
  },
}
//FetchCreateContextFnOptions
export { CryptoAddress, ContractAddress, OAuthAddress, Address }
