import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import type { CreateNextContextOptions } from '@trpc/server/adapters/next'

import { createContext } from './context'
import { appRouter } from './jsonrpc/router'
import Account from './nodes/account'

export interface Environment {
  Account: DurableObjectNamespace
}

export default {
  async fetch(request: Request, env: Environment): Promise<Response> {
    return fetchRequestHandler({
      endpoint: '/trpc',
      req: request,
      router: appRouter,
      createContext: (opts) =>
        createContext(opts as CreateNextContextOptions, env),
    })
  },
}
export { Account }
