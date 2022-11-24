import { Router } from 'itty-router'
import { error } from 'itty-router-extras'

import type { WorkerApi as AccessApi } from '@kubelt/platform.access/src/types'
import { createFetcherJsonRpcClient } from '@kubelt/platform.commons/src/jsonrpc'

import * as openrpc from '@kubelt/openrpc'
import { RpcContext, RpcRequest, RpcService } from '@kubelt/openrpc'
import { KEY_REQUEST_ENV } from '@kubelt/openrpc/constants'

import schema from './schema'
import { Environment } from './types'

const scopes = openrpc.scopes([])

const verifyAuthorization = openrpc.method(schema, {
  name: 'kb_verifyAuthorization',
  scopes: scopes,
  handler: openrpc.handler(
    async (
      service: Readonly<RpcService>,
      request: Readonly<RpcRequest>,
      context: Readonly<RpcContext>
    ) => {
      const env: Environment = context.get(KEY_REQUEST_ENV)
      const access = createFetcherJsonRpcClient<AccessApi>(env.Access)
      const [token] = request.params as [string]
      const result = await access.kb_verifyAuthorization(token)
      return openrpc.response(request, result)
    }
  ),
})

const methods = openrpc.methods(schema, [verifyAuthorization])
const extensions = openrpc.extensions(schema, [])
const options = openrpc.options({ rpcDiscover: true })
const service = openrpc.service(schema, scopes, methods, extensions, options)

const basePath = '/'
const rootPath = '/jsonrpc'
const chain = openrpc.chain([])
const rpcHandler = openrpc.build(service, basePath, rootPath, chain)

const index = Router()
  .post(
    '/jsonrpc',
    (
      request: Request,
      env: Environment,
      ctx: ExecutionContext
    ): Promise<Response> => {
      const context = openrpc.context(request, env, ctx)
      return rpcHandler(request, context)
    }
  )
  .all('*', () => error(400, 'not found'))

export default { fetch: index.handle }
