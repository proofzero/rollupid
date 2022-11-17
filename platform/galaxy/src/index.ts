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
    if (!env.OORT) {
      throw Error('OORT service bind not set')
    }
    if (!env.NFT_SCAN_API_KEY) {
      throw Error('NFT_SCAN_API_KEY not set')
    }
    // if (!env.ALCHEMY_API_KEY) {
    //   throw Error('ALCHEMY_API_URL not set')
    // }
    // if (!env.ALCHEMY_NETWORK) {
    //   throw Error('ALCHEMY_NETWORK not set')
    // }
    return yoga.handleRequest(request, { env, ctx })
  },
}
