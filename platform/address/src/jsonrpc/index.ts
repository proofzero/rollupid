import * as openrpc from '@kubelt/openrpc'
import getAccessClient from '@kubelt/platform-clients/access'

import schema from '../schemas/worker'
import { Environment } from '../types'

import resolveAccount from './methods/resolveAccount'
import getAccount from './methods/getAccount'
import setAccount from './methods/setAccount'
import unsetAccount from './methods/unsetAccount'
import getNonce from './methods/getNonce'
import verifyNonce from './methods/verifyNonce'
import getAddressProfile from './methods/getAddressProfile'
import setAddressProfile from './methods/setAddressProfile'
import getPfpVoucher from './methods/getPfpVoucher'

import parse3RN from './middlewares/parse3RN'
import checkCryptoNode from './middlewares/checkCryptoNode'
import resolveENS from './middlewares/resolveENS'
import setCryptoNodeClient from './middlewares/setCryptoNodeClient'
import initCryptoNode from './middlewares/initCryptoNode'

const rpcHandler = openrpc.build(
  openrpc.service(
    schema,
    openrpc.scopes([]),
    openrpc.methods(schema, [
      openrpc.method(schema, {
        name: 'kb_resolveAccount',
        scopes: openrpc.scopes([]),
        handler: openrpc.handler(resolveAccount),
      }),
      openrpc.method(schema, {
        name: 'kb_getAccount',
        scopes: openrpc.scopes([]),
        handler: openrpc.handler(getAccount),
      }),
      openrpc.method(schema, {
        name: 'kb_setAccount',
        scopes: openrpc.scopes([]),
        handler: openrpc.handler(setAccount),
      }),
      openrpc.method(schema, {
        name: 'kb_unsetAccount',
        scopes: openrpc.scopes([]),
        handler: openrpc.handler(unsetAccount),
      }),
      openrpc.method(schema, {
        name: 'kb_getNonce',
        scopes: openrpc.scopes([]),
        handler: openrpc.handler(getNonce),
      }),
      openrpc.method(schema, {
        name: 'kb_verifyNonce',
        scopes: openrpc.scopes([]),
        handler: openrpc.handler(verifyNonce),
      }),
      openrpc.method(schema, {
        name: 'kb_getAddressProfile',
        scopes: openrpc.scopes([]),
        handler: openrpc.handler(getAddressProfile),
      }),
      openrpc.method(schema, {
        name: 'kb_setAddressProfile',
        scopes: openrpc.scopes([]),
        handler: openrpc.handler(setAddressProfile),
      }),
      openrpc.method(schema, {
        name: 'kb_getPfpVoucher',
        scopes: openrpc.scopes([]),
        handler: openrpc.handler(getPfpVoucher),
      }),
    ]),
    openrpc.extensions(schema, []),
    openrpc.options({ rpcDiscover: true })
  ),
  '/',
  '/jsonrpc',
  openrpc.chain([
    openrpc.middleware(parse3RN),
    openrpc.middleware(checkCryptoNode),
    openrpc.middleware(resolveENS),
    openrpc.middleware(setCryptoNodeClient),
    openrpc.middleware(initCryptoNode),
  ])
)

export default (request: Request, env: Environment, ctx: ExecutionContext) => {
  const context = openrpc.context(request, env, ctx)
  context.set('Access', getAccessClient(env.Access))
  context.set('Edges', env.Edges)
  context.set('CryptoAddress', env.CryptoAddress)
  context.set('NFTAR_CHAIN_ID', env.NFTAR_CHAIN_ID)
  context.set('TOKEN_NFTAR', env.TOKEN_NFTAR)
  context.set('NFTAR_URL', env.NFTAR_URL)
  return rpcHandler(request, context)
}
