import { Router } from 'itty-router'

import Core from './core'
import jsonRpcHandler from './jsonrpc'

const index = Router().post('/jsonrpc', jsonRpcHandler)

export { Core }
export default { fetch: index.handle }
