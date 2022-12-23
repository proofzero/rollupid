// import { Router } from 'itty-router'
// import { error } from 'itty-router-extras'

// import jsonrpc from './jsonrpc'
import queue from './queue'

// const index = Router()
//   .post('/jsonrpc', jsonrpc)
//   .all('*', () => error(404, 'not found'))

// // TODO: export ContractAddress when ready
// export default { fetch: index.handle, queue }

import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { createContext } from './context'
import { appRouter } from './router'
import { Environment } from './types'
export default {
  async fetch(request: Request, env: Environment): Promise<Response> {
    return fetchRequestHandler({
      endpoint: '/trpc',
      req: request,
      router: appRouter,
      createContext,
    })
  },
  queue,
}
