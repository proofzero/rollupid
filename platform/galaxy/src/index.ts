import { createYoga } from 'graphql-yoga'
import {
  generateTraceSpan,
  TraceSpan,
} from '@proofzero/platform-middleware/trace'
import Env from './env'
import schema from './schema'

export type GalaxyServerContext = {
  env: Env
  ctx: ExecutionContext
  traceSpan: TraceSpan
}

const yoga = createYoga<GalaxyServerContext>({ schema })

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const traceSpan = generateTraceSpan(request.headers)
    console.debug('Starting GQL handler', traceSpan.toString())
    const result = (await yoga.fetch(request, {
      env,
      ctx,
      traceSpan,
    })) as Response
    console.debug('Completed GQL handler', traceSpan.toString())
    return result
  },
}
