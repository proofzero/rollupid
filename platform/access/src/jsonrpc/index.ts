import * as openrpc from '@kubelt/openrpc'

import getStarbaseClient from '@kubelt/platform-clients/starbase'

import schema from '../schemas/worker'
import { Environment } from '../types'

import authorize from './methods/authorize'
import exchangeToken from './methods/exchangeToken'
import verifyAuthorization from './methods/verifyAuthorization'

const rpcHandler = openrpc.build(
  openrpc.service(
    schema,
    openrpc.scopes([]),
    openrpc.methods(schema, [
      openrpc.method(schema, {
        name: 'kb_authorize',
        scopes: openrpc.scopes([]),
        handler: openrpc.handler(authorize),
      }),
      openrpc.method(schema, {
        name: 'kb_exchangeToken',
        scopes: openrpc.scopes([]),
        handler: openrpc.handler(exchangeToken),
      }),
      openrpc.method(schema, {
        name: 'kb_verifyAuthorization',
        scopes: openrpc.scopes([]),
        handler: openrpc.handler(verifyAuthorization),
      }),
    ]),
    openrpc.extensions(schema, []),
    openrpc.options({ rpcDiscover: true })
  ),
  '/',
  '/jsonrpc',
  openrpc.chain([])
)

export default (request: Request, env: Environment, ctx: ExecutionContext) => {
  const context = openrpc.context(request, env, ctx)
  context.set('Authorization', env.Authorization)
  context.set('Access', env.Access)
  context.set('Starbase', getStarbaseClient(env.Starbase))
  return rpcHandler(request, context)
}
