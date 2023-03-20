// @proofzero/platform.edges:/src/index.ts

/**
 * This Cloudflare worker is for experimenting with the graph "edges"
 * database.
 *
 * @packageDocumentation
 */
import {
  fetchRequestHandler,
  FetchCreateContextFnOptions,
} from '@trpc/server/adapters/fetch'

import { serverOnError as onError } from '@proofzero/utils/trpc'

import { createContext } from './context'
import { appRouter } from './jsonrpc/router'
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
