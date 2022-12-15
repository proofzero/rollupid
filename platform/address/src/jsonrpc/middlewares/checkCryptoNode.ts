import type { RpcContext } from '@kubelt/openrpc'

import { NodeType } from '../../types'
import { isCryptoAddressType } from '../../utils'

export default (request: Readonly<Request>, context: RpcContext) => {
  const nodeType = context.get('node_type')
  if (nodeType != NodeType.Crypto && nodeType != NodeType.Contract) {
    return
  }

  const addrType = context.get('addr_type')
  if (!isCryptoAddressType(addrType)) {
    throw `unsupported crypto address type: ${addrType}`
  }
}
