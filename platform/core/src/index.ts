import {
  fetchRequestHandler,
  FetchCreateContextFnOptions,
} from '@trpc/server/adapters/fetch'

import { serverOnError as onError } from '@proofzero/utils/trpc'

import { createContext, type Context } from './context'
import router from './router'
import type { Environment } from './types'

export {
  Access as Authorization,
  Authorization as ExchangeCode,
} from '@proofzero/platform.access'
export { Account as Identity, IdentityGroup } from '@proofzero/platform.account'
export { Address as Account } from '@proofzero/platform.address'
export { StarbaseApplication } from '@proofzero/platform.starbase'

export default {
  async fetch(request: Request, env: Environment): Promise<Response> {
    return fetchRequestHandler({
      endpoint: '/trpc',
      req: request,
      router,
      onError,
      createContext: (opts: FetchCreateContextFnOptions) =>
        createContext(opts, env),
    })
  },
}

export { router, type Context, type Environment }
