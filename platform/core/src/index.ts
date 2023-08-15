import {
  fetchRequestHandler,
  FetchCreateContextFnOptions,
} from '@trpc/server/adapters/fetch'

import { serverOnError as onError } from '@proofzero/utils/trpc'

import { createContext, type Context } from './context'
import router from './router'
import type { Environment } from './types'

import runMigration from './migration'

export { Account } from '@proofzero/platform.account'
export { Identity, IdentityGroup } from '@proofzero/platform.identity'
export { Authorization, ExchangeCode } from '@proofzero/platform.authorization'
export { StarbaseApplication } from '@proofzero/platform.starbase'

export default {
  async fetch(request: Request, env: Environment): Promise<Response> {
    const secret = request.headers.get('X-Rollup-Secret')
    if (secret !== 'secret')
      return new Response("couldn't guess the secret", { status: 401 })

    const limit = Number(request.headers.get('X-Migration-Limit'))
    if (typeof limit !== 'number')
      return new Response('no limit', { status: 400 })

    const offset = Number(request.headers.get('X-Migration-Offset'))
    if (typeof offset !== 'number')
      return new Response('no offset', { status: 400 })

    await runMigration(limit, offset, env)

    return new Response('SUCCESS')
  },
}

export { router, type Context, type Environment }
