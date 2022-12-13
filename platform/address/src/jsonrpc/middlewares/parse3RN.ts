import { isAddress as isEthAddress } from '@ethersproject/address'

import type { RpcContext } from '@kubelt/openrpc'

import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'

import { NodeType } from '../../types'
import { isNodeType } from '../../utils'

export default (request: Readonly<Request>, context: RpcContext) => {
  const header = request.headers.get('X-3RN')
  if (!header) {
    throw new Error('missing X-3RN header')
  }
  const urn = header as AddressURN
  const name = AddressURNSpace.decode(urn)

  if (!name) {
    throw `missing 3RN name: ${urn}`
  }

  const { rcomponent, qcomponent } = AddressURNSpace.parse(urn)
  const rparams = new URLSearchParams(rcomponent || '')

  let type = rparams.get('addr_type')
  if (!type) {
    if (isEthAddress(name)) {
      type = 'ethereum'
    } else if (name.endsWith('.eth')) {
      type = 'ethereum'
    }
  }

  context.set('name', name)
  context.set('addr_type', type)
  context.set('params', new URLSearchParams(qcomponent as string))

  const nodeType = rparams.get('node_type') || ''
  if (nodeType && !isNodeType(nodeType)) {
    throw `invalid 3RN node type: ${nodeType}`
  }

  if (nodeType) {
    context.set('node_type', nodeType)
  } else if (name.startsWith('0x')) {
    context.set('node_type', NodeType.Crypto)
  } else if (name.endsWith('.eth')) {
    context.set('node_type', NodeType.Crypto)
  } else {
    throw `cannot determine node type: ${urn}`
  }
}
