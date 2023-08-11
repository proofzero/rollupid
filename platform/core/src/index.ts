import {
  fetchRequestHandler,
  FetchCreateContextFnOptions,
} from '@trpc/server/adapters/fetch'

import { serverOnError as onError } from '@proofzero/utils/trpc'

import { createContext, type Context } from './context'
import router from './router'
import type { Environment } from './types'
import { ResolveConfigFn, instrument } from '@microlabs/otel-cf-workers'
import { ReadableSpan } from '@opentelemetry/sdk-trace-base'

export {
  Access as Authorization,
  Authorization as ExchangeCode,
} from '@proofzero/platform.access'
export { Account as Identity, IdentityGroup } from '@proofzero/platform.account'
export { Address as Account } from '@proofzero/platform.address'
export { StarbaseApplication } from '@proofzero/platform.starbase'

const postProcessor = (spans: ReadableSpan[]): ReadableSpan[] => {
  console.debug('SPANS', JSON.stringify(spans))
  return spans
}

const config: ResolveConfigFn = (env: Environment, _trigger) => {
  return {
    exporter: {
      url: 'https://api.honeycomb.io/v1/traces',
      headers: { 'x-honeycomb-team': env.SECRET_HONEYCOMB_API_KEY },
    },
    service: { name: 'core' },
    postProcessor: postProcessor,
  }
}

export default instrument(
  {
    async fetch(
      request: Request,
      env: Environment,
      ctx: Context
    ): Promise<Response> {
      console.debug('NEW CORE REQUEST', request.url)
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
