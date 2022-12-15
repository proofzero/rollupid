import * as openrpc from '@kubelt/openrpc'

import schema from '../schemas/worker'
import { Environment } from '../types'

import getObject from './methods/getObject'
import putObject from './methods/putObject'

const rpcHandler = openrpc.build(
  openrpc.service(
    schema,
    openrpc.scopes([]),
    openrpc.methods(schema, [
      openrpc.method(schema, {
        name: 'kb_getObject',
        scopes: openrpc.scopes([]),
        handler: openrpc.handler(getObject),
      }),
      openrpc.method(schema, {
        name: 'kb_putObject',
        scopes: openrpc.scopes([]),
        handler: openrpc.handler(putObject),
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
  context.set('Bucket', env.Bucket)
  context.set('Meta', env.Meta)
  return rpcHandler(request, context)
}
