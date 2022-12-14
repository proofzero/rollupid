import { Router } from 'itty-router'
import { error } from 'itty-router-extras'

import Account from './nodes/account'
import jsonRpc from './jsonrpc'

const index = Router()
  .post('/jsonrpc', jsonRpc)
  .all('*', () => error(404, 'not found'))

export { Account }
export default { fetch: index.handle }
