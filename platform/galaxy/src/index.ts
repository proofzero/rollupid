import { createYoga, maskError as _maskError } from 'graphql-yoga'
import { useSofaWithSwaggerUI } from '@graphql-yoga/plugin-sofa'

import {
  generateTraceSpan,
  TraceSpan,
} from '@proofzero/platform-middleware/trace'

import { formatError } from '@proofzero/utils/yoga'

import Env from './env'
import schema from './schema'

export type GalaxyServerContext = {
  env: Env
  ctx: ExecutionContext
  traceSpan: TraceSpan
}

const plugins = [
  useSofaWithSwaggerUI({
    servers: [{ url: 'https://galaxy.rollup.id', description: 'Production' }],
    components: {
      securitySchemes: {
        galaxyApiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-GALAXY-API-KEY',
          description: 'Galaxy API Key',
        },
        Authorization: {
          type: 'http',
          scheme: 'bearer',
          description: 'Please insert JWT token into field',
          bearerFormat: 'JWT',
        },
      },
    },
    basePath: '/rest',
    swaggerUIEndpoint: '/swagger',
    info: {
      title: 'Galaxy API',
      version: '0.1',
    },
  }),
]

const maskError = (error: unknown, message: string, isDev?: boolean): Error =>
  formatError(error) ?? _maskError(error, message, isDev)

const yoga = createYoga<GalaxyServerContext>({
  schema,
  maskedErrors: { maskError },
  plugins,
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
