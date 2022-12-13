import { Router } from 'itty-router'
import { error } from 'itty-router-extras'

import CryptoAddress from './nodes/crypto'
import jsonrpc from './jsonrpc'

const index = Router()
  .post('/jsonrpc', jsonrpc)
  .all('*', () => error(404, 'not found'))

export { CryptoAddress }
export default { fetch: index.handle }
