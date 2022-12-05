import { Router } from 'itty-router'

import { handleOptions } from '@kubelt/platform.commons/src/routers/cors'
import { discoveryHandler } from '@kubelt/platform.commons/src/routers/openrpc'
import checkEnv from '@kubelt/platform.commons/src/utils/checkEnv'

import Core from './core'
import CryptoCore from './crypto-core'
import jsonRpcHandler from './jsonrpc'
import serviceDescription from './openrpc.json'

import { required as requiredEnv } from './env'

const index = Router()
  .all('*', (_: unknown, env: Record<string, unknown>) =>
    checkEnv(requiredEnv, env)
  )
  .get('/openrpc.json', discoveryHandler(serviceDescription))
  .options('/jsonrpc', handleOptions({ headers: ['Content-Type'] }))
  .post('/jsonrpc', jsonRpcHandler)

export { Core, CryptoCore }
export default { fetch: index.handle }
