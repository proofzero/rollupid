
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { createContext } from './context'
import { appRouter } from './jsonrpc/router'
import queue from './queue'

export default {
  async fetch(request: Request): Promise<Response> {
    return fetchRequestHandler({
      endpoint: '/trpc',
      req: request,
      router: appRouter,
      createContext,
    })
  },
  queue,
}
