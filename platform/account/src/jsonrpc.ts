import { createFetcherJsonRpcClient } from '@kubelt/platform.commons/src/jsonrpc'

import * as openrpc from '@kubelt/openrpc'
import { RpcContext, RpcRequest, RpcService } from '@kubelt/openrpc'
import mwOnlyLocal from '@kubelt/openrpc/middleware/local'

import { KEY_OBJECT_CORE, KEY_SERVICE_OORT } from './constants'
import { worker as schema } from './schema'
import { Environment } from './types'

const scopes = openrpc.scopes([])

const getProfile = openrpc.method(schema, {
  name: 'kb_getProfile',
  scopes: scopes,
  handler: openrpc.handler(
    async (
      service: Readonly<RpcService>,
      request: Readonly<RpcRequest>,
      context: Readonly<RpcContext>
    ) => {
      const [id] = request.params as [string]
      const Core: DurableObjectNamespace = context.get(KEY_OBJECT_CORE)
      const core = await openrpc.discover(Core, { name: id })
      const profile = await core.getProfile()
      return openrpc.response(request, profile)
    }
  ),
})

const setProfile = openrpc.method(schema, {
  name: 'kb_setProfile',
  scopes: scopes,
  handler: openrpc.handler(
    async (
      service: Readonly<RpcService>,
      request: Readonly<RpcRequest>,
      context: Readonly<RpcContext>
    ) => {
      const [id, profile] = request.params as [string, object]
      const Core: DurableObjectNamespace = context.get(KEY_OBJECT_CORE)
      const core = await openrpc.discover(Core, { name: id })
      return openrpc.response(request, await core.setProfile({ profile }))
    }
  ),
})

const methods = openrpc.methods(schema, [getProfile, setProfile])
const extensions = openrpc.extensions(schema, [])
const options = openrpc.options({ rpcDiscover: true })
const service = openrpc.service(schema, scopes, methods, extensions, options)

const basePath = '/'
const rootPath = '/jsonrpc'
const chain = openrpc.chain([mwOnlyLocal])
const rpcHandler = openrpc.build(service, basePath, rootPath, chain)

export default async (
  request: Request,
  env: Environment,
  ctx: ExecutionContext
): Promise<Response> => {
  const context = openrpc.context(request, env, ctx)
  context.set(KEY_OBJECT_CORE, env.Core)
  context.set(KEY_SERVICE_OORT, env.Oort)
  return rpcHandler(request, context)
}
