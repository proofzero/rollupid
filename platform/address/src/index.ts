import { Router } from 'itty-router'
import { error } from 'itty-router-extras'

import { CryptoAddressType } from './types'
import CryptoAddress from './nodes/crypto'
import ContractAddress from './nodes/contract'
import jsonrpc from './jsonrpc'

const index = Router()
  .post('/jsonrpc', jsonrpc)
  .all('*', () => error(404, 'not found'))

// TODO: export ContractAddress when ready
export { CryptoAddress, CryptoAddressType }
export default { fetch: index.handle }
