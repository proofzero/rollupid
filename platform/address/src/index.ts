import { Router } from 'itty-router'
import { error } from 'itty-router-extras'

import CryptoAddress from './nodes/crypto'
import ContractAddress from './nodes/contract'
import OAuthAddress from './nodes/oauth'
import jsonrpc from './jsonrpc'

const index = Router()
  .post('/jsonrpc', jsonrpc)
  .all('*', () => error(404, 'not found'))

// TODO: export ContractAddress when ready
export { CryptoAddress, OAuthAddress, ContractAddress }
export default { fetch: index.handle }
