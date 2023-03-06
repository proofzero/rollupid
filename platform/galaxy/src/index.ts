import { createServer } from '@graphql-yoga/common'
import { generateTraceSpan, TraceSpan } from '@kubelt/platform-middleware/trace'
import Env from './env'
import schema from './schema'

type GalaxyServerContext = {
  env: Env
  ctx: ExecutionContext
  traceSpan: TraceSpan
}

const yoga = createServer<GalaxyServerContext>({
  schema,
  context: ({ request, extensions, ...rest }) => {
    return { request, extensions, ...rest }
  },
})

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const traceSpan = generateTraceSpan(request.headers)
    console.debug('Starting GQL handler, trace span: ', traceSpan.toString())
    const result = (await yoga.handleRequest(request, {
      env,
      ctx,
      traceSpan,
    })) as Response
    console.debug('Completed GQL handler, trace span: ', traceSpan.toString())
    return result
  },
}
