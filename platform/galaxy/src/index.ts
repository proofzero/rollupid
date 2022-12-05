import { createServer } from '@graphql-yoga/common'

import checkEnv from '@kubelt/platform.commons/src/utils/checkEnv'

import Env, { required as requiredEnv } from './env'
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
    checkEnv(requiredEnv, env as unknown as Record<string, unknown>)
    return yoga.handleRequest(request, { env, ctx })
  },
}
