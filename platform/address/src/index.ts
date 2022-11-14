import { Router } from 'itty-router'

import { handleOptions } from '@kubelt/worker-commons/src/routers/cors'
import { discoveryHandler } from '@kubelt/worker-commons/src/routers/openrpc'

import Core from './core'
import jsonRpcHandler from './jsonrpc'
import serviceDescription from './openrpc.json'

const index = Router()
  .get('/openrpc.json', discoveryHandler(serviceDescription))
  .options('/jsonrpc', handleOptions({ headers: ['Content-Type'] }))
  .post('/jsonrpc', jsonRpcHandler)

export { Core }
export default { fetch: index.handle }
