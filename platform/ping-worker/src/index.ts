import { Router } from 'itty-router'
import { error } from 'itty-router-extras'

import { coreRequestHandler } from '@kubelt/worker-commons/src/routers/core'
import { handleOptions } from '@kubelt/worker-commons/src/routers/cors'
import { discoveryHandler } from '@kubelt/worker-commons/src/routers/openrpc'

import Core from './core'
import { Environment } from './types'
import serviceDescription from './openrpc.json'

const index = Router()
  .get('/openrpc.json', discoveryHandler(serviceDescription))
  .options('/jsonrpc', handleOptions({ headers: ['Content-Type'] }))
  .post('/jsonrpc', coreRequestHandler<Environment>)
  .all('*', () => error(404, 'not found'))

export { Core }
export default { fetch: index.handle }
