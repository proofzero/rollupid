import { createYoga } from 'graphql-yoga'
import { useSofaWithSwaggerUI } from '@graphql-yoga/plugin-sofa'

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

const yoga = createYoga<GalaxyServerContext>({
  schema,
  plugins: [
    useSofaWithSwaggerUI({
      basePath: '/rest',
      swaggerUIEndpoint: '/swagger',
      info: {
        title: 'Galaxy API',
        version: '0.0.1',
      },
    }),
  ],
})

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
