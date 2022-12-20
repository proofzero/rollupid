import { Router } from 'itty-router'
import { error } from 'itty-router-extras'

import CryptoAddress from './nodes/crypto'
import ContractAddress from './nodes/contract'
import jsonrpc from './jsonrpc'
import queue from './queue'

const index = Router()
  .post('/jsonrpc', jsonrpc)
  .all('*', () => error(404, 'not found'))

// TODO: export ContractAddress when ready
export { CryptoAddress }
export default { fetch: index.handle, queue }
