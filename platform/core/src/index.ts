import { type Context } from './context'
import router from './router'
import type { Environment } from './types'

export { Account } from '@proofzero/platform.account'
export { Identity, IdentityGroup } from '@proofzero/platform.identity'
export { Authorization, ExchangeCode } from '@proofzero/platform.authorization'
export { StarbaseApplication } from '@proofzero/platform.starbase'

import runMigration from './migration'

export default {
  async fetch(request: Request, env: Environment): Promise<Response> {
    const secret = request.headers.get('x-migration-secret')
    if (secret !== 'secret')
      return new Response("couldn't guess the secret", { status: 401 })

    const { limit, offset } = await request.json<{
      limit: number
      offset: number
    }>()

    if (typeof limit !== 'number')
      return new Response('invalid limit', { status: 400 })
    if (typeof offset !== 'number')
      return new Response('invalid offset', { status: 400 })

    try {
      const result = await runMigration(limit, offset, env)
      return new Response(JSON.stringify(result, null, 2), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    } catch (error) {
      return new Response(JSON.stringify(error, null, 2), {
        status: 500,
      })
    }
  },
}

export { router, type Context, type Environment }
