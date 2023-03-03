import { createServer } from '@graphql-yoga/common'
import Env from './env'
import schema from './schema'

const yoga = createServer<{ env: Env; ctx: ExecutionContext }>({
  schema,
  context: ({ request, extensions, ...rest }) => {
    //TODO: Create span from parent
    return { request, extensions, ...rest }
  },
})

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const startTime = Date.now()
    console.debug('GALAXY START', request.headers)
    const result = (await yoga.handleRequest(request, { env, ctx })) as Response
    console.debug('GALAXY END', Date.now() - startTime)
    return result
  },
}
