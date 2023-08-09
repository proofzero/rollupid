import {
  fetchRequestHandler,
  FetchCreateContextFnOptions,
} from '@trpc/server/adapters/fetch'

import { serverOnError as onError } from '@proofzero/utils/trpc'

import { createContext, type Context } from './context'
import router from './router'
import type { Environment } from './types'
import { ResolveConfigFn, instrument } from '@microlabs/otel-cf-workers'

export {
  Access as Authorization,
  Authorization as ExchangeCode,
} from '@proofzero/platform.access'
export { Account as Identity, IdentityGroup } from '@proofzero/platform.account'
export { Address as Account } from '@proofzero/platform.address'
export { StarbaseApplication } from '@proofzero/platform.starbase'

const config: ResolveConfigFn = (env: Environment, _trigger) => {
  return {
    exporter: {
      url: 'https://api.honeycomb.io/v1/traces',
      headers: { 'x-honeycomb-team': '' },
    },
    service: { name: 'passport' },
  }
}

export default instrument(
  {
    async fetch(
      request: Request,
      env: Environment,
      ctx: Context
    ): Promise<Response> {
      console.log('ENV', JSON.stringify(env, null, 2))
      console.log('CTX', ctx)
      const D1result = await env.EDGES.prepare('SELECT * from node').all()
      console.log('D1', {
        duration: D1result.meta.duration,
        error: D1result.error,
        results: D1result.results?.length,
      })
      // return new Response('blah', { status: 200 })
      return fetchRequestHandler({
        endpoint: '/trpc',
        req: request,
        router,
        onError,
        createContext: (opts: FetchCreateContextFnOptions) =>
          createContext(opts, env),
      })
    },
  },
  config
)

export { router, type Context, type Environment }
