import { Router } from 'itty-router'

import { coreRequestHandler } from '../../commons/src/routers/core'
import { handleOptions } from '../../commons/src/routers/cors'
import { discoveryHandler } from '../../commons/src/routers/openrpc'

import Core from './core'
import serviceDescription from './openrpc.json'

const index = Router()
  .get('/openrpc.json', discoveryHandler(serviceDescription))
  .options(
    '/jsonrpc',
    handleOptions({
      headers: ['Content-Type', 'KBT-Access-JWT-Assertion'],
    })
  )
  .post('/jsonrpc', coreRequestHandler)

export { Core }
export default { fetch: index.handle }
