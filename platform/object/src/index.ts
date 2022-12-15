import { Router } from 'itty-router'
import { error } from 'itty-router-extras'

import jsonRpc from './jsonrpc'

const index = Router()
  .post('/jsonrpc', jsonRpc)
  .all('*', () => error(404, 'not found'))

export default { fetch: index.handle }
