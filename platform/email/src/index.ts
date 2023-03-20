import {
  fetchRequestHandler,
  FetchCreateContextFnOptions,
} from '@trpc/server/adapters/fetch'

import { serverOnError as onError } from '@proofzero/utils/trpc'

import { createContext } from './context'
import { appRouter } from './jsonrpc/router'

import type { Environment, CloudflareEmailMessage } from './types'

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

  async email(message: CloudflareEmailMessage, env: Environment) {
    //TODO: Implement email masking
    //This is where you'd receive an email, check destination
    //address, lookup unmasked address and forward
  },
}
