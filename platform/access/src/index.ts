import { Router } from 'itty-router'
import { error } from 'itty-router-extras'

import Access from './nodes/access'
import Authorization from './nodes/authorization'
import jsonRpc from './jsonrpc'

const index = Router()
  .post('/jsonrpc', jsonRpc)
  .all('*', () => error(404, 'not found'))

export { Access, Authorization }
export default { fetch: index.handle }
