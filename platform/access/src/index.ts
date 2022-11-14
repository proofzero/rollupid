import { Router } from 'itty-router'

import { handleOptions } from '@kubelt/platform.commons/src/routers/cors'
import { discoveryHandler } from '@kubelt/platform.commons/src/routers/openrpc'

import Access from './access'
import Authorization from './authorization'
import jsonRpcHandler from './jsonrpc'
import serviceDescription from './openrpc.json'

const index = Router()
  .get('/openrpc.json', discoveryHandler(serviceDescription))
  .options(
    '/jsonrpc',
    handleOptions({
      headers: ['Content-Type', 'KBT-Access-JWT-Assertion'],
    })
  )
  .post('/jsonrpc', jsonRpcHandler)

export { Access, Authorization }
export default { fetch: index.handle }
