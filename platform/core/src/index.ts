import {
  fetchRequestHandler,
  FetchCreateContextFnOptions,
} from '@trpc/server/adapters/fetch'

import { serverOnError as onError } from '@proofzero/utils/trpc'

import { createContext, type Context } from './context'
import router from './router'
import relay, { type CloudflareEmailMessage } from './relay'
import type { Environment } from './types'

export { Account } from '@proofzero/platform.account'
export { Identity, IdentityGroup } from '@proofzero/platform.identity'
export { Authorization, ExchangeCode } from '@proofzero/platform.authorization'
export { StarbaseApplication } from '@proofzero/platform.starbase'

export default {
  async fetch(
    request: Request,
    env: Environment,
    ctx: ExecutionContext
  ): Promise<Response> {
    return fetchRequestHandler({
      endpoint: '/trpc',
      req: request,
      router,
      onError,
      createContext: (
        opts: FetchCreateContextFnOptions & {
          // It doesn't exist on native tRPC types, so we can't force it here
          waitUntil?: (promise: Promise<unknown>) => void
        }
      ) => {
        Object.assign(opts, { waitUntil: ctx.waitUntil.bind(ctx) })
        return createContext(opts, env)
      },
    })
  },
  async email(message: CloudflareEmailMessage, env: Environment) {
    const decoder = new TextDecoder()
    const reader = message.raw.getReader()

    let content = ''
    let { done, value } = await reader.read()
    while (!done) {
      content += decoder.decode(value)
      ;({ done, value } = await reader.read())
    }

    return relay(content, env)
  },
}

export { router, type Context, type Environment }
