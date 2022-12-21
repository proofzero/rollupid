import * as openrpc from '@kubelt/openrpc'
import getAccessClient from '@kubelt/platform-clients/access'

import schema from '../schemas/worker'
import { Environment, IndexRpcContext } from '../types'

import injectDB from './middlewares/injectDB'

import setGallery from './methods/setGallery'
import getGallery from './methods/getGallery'

const rpcHandler = openrpc.build(
  openrpc.service(
    schema,
    openrpc.scopes([]),
    openrpc.methods(schema, [
      openrpc.method(schema, {
        name: 'kb_getGallery',
        scopes: openrpc.scopes([]),
        handler: openrpc.handler(getGallery),
      }),
      openrpc.method(schema, {
        name: 'kb_setGallery',
        scopes: openrpc.scopes([]),
        handler: openrpc.handler(setGallery),
      }),
    ]),
    openrpc.extensions(schema, []),
    openrpc.options({ rpcDiscover: true })
  ),
  '/',
  '/jsonrpc',
  openrpc.chain([openrpc.middleware(injectDB)])
)

export default (request: Request, env: Environment, ctx: ExecutionContext) => {
  const context = openrpc.context(request, env, ctx) as IndexRpcContext
  context.Access = getAccessClient(env.Access)
  context.Edges = env.Edges
  context.URL_MORALIS_WEBHOOK = env.URL_MORALIS_WEBHOOK
  context.APIKEY_MORALIS = env.APIKEY_MORALIS
  context.MORALIS_STREAM_ID = env.MORALIS_STREAM_ID
  context.BLOCKCHAIN_ACTIVITY = env.BLOCKCHAIN_ACTIVITY
  // context.set('Access', getAccessClient(env.Access))
  // context.set('Edges', env.Edges)
  // context.set('URL_MORALIS_WEBHOOK', env.URL_MORALIS_WEBHOOK)
  // context.set('APIKEY_MORALIS', env.APIKEY_MORALIS)
  // context.set('MORALIS_STREAM_ID', env.MORALIS_STREAM_ID)
  // context.set('BLOCKCHAIN_ACTIVITY', env.BLOCKCHAIN_ACTIVITY)

  return rpcHandler(request, context)
}
