import { createServer } from '@graphql-yoga/common'

import Env from './env'
import schema from './schema'

const yoga = createServer<{ env: Env; ctx: ExecutionContext }>({
  schema,
  context: ({ request, extensions, ...rest }) => {
    // TODO: setup context
    return { request, extensions, ...rest }
  },
})

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    if (!env.Oort) {
      throw Error('Oort service bind not set')
    }
    if (!env.Account) {
      throw Error('Account service bind not set')
    }
    if (!env.Address) {
      throw Error('Address service bind not set')
    }
    if (!env.Icons) {
      throw Error('Icons service bind not set')
    }
    if (!env.ALCHEMY_KEYS) {
      throw Error('ALCHEMY_KEYS not set')
    }
    if (!env.ALCHEMY_CHAINS) {
      throw Error('ALCHEMY_CHAINS not set')
    }
    if (!env.ALCHEMY_NETWORKS) {
      throw Error('ALCHEMY_NETWORKS not set')
    }
    return yoga.handleRequest(request, { env, ctx })
  },
}
