import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import type { CreateNextContextOptions } from '@trpc/server/adapters/next'

import { createContext } from './context'
import { appRouter } from './jsonrpc/router'
import queue from './queue'

export interface Environment {
  Access: Fetcher
  Edges: Fetcher

  COLLECTIONS: D1Database

  APIKEY_MORALIS: string
  MORALIS_STREAM_ID: string
  URL_MORALIS_WEBHOOK: string

  BLOCKCHAIN_ACTIVITY: Queue
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
  queue,
}
