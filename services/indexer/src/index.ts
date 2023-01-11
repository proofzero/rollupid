import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'

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
      onError({ error, type, path, input, ctx, req }) {
        console.error('Error:', error)
      },
      createContext: (opts) =>
        createContext(opts as FetchCreateContextFnOptions, env),
    })
  },
  queue,
}
