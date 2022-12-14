import * as openrpc from '@kubelt/openrpc'

import schema from '../schemas/worker'
import { Environment } from '../types'

import getProfile from './methods/getProfile'
import setProfile from './methods/getProfile'

const rpcHandler = openrpc.build(
  openrpc.service(
    schema,
    openrpc.scopes([]),
    openrpc.methods(schema, [
      openrpc.method(schema, {
        name: 'kb_getProfile',
        scopes: openrpc.scopes([]),
        handler: openrpc.handler(getProfile),
      }),
      openrpc.method(schema, {
        name: 'kb_setProfile',
        scopes: openrpc.scopes([]),
        handler: openrpc.handler(setProfile),
      }),
    ]),
    openrpc.extensions(schema, []),
    openrpc.options({ rpcDiscover: true })
  ),
  '/',
  '/jsonrpc',
  openrpc.chain([])
)

export default async (
  request: Request,
  env: Environment,
  ctx: ExecutionContext
): Promise<Response> => {
  const context = openrpc.context(request, env, ctx)
  context.set('Account', env.Account)
  return rpcHandler(request, context)
}
