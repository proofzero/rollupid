import { isAddress as isEthAddress } from '@ethersproject/address'

import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'
import { BaseMiddlewareFunction } from '@kubelt/platform-middleware/types'

import { HEADER_3RN } from '../../constants'
import { Context } from '../../context'

import { NodeType } from '@kubelt/types/address'
import { isNodeType } from '../../utils'

export const parse3RN: BaseMiddlewareFunction<Context> = async ({
  ctx,
  next,
}) => {
  const header = ctx.address3RN || ctx.req?.headers.get(HEADER_3RN)
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

  let addrType = rparams.get('addr_type')
  if (!addrType) {
    if (isEthAddress(name)) {
      addrType = 'ethereum'
    } else if (name.endsWith('.eth')) {
      addrType = 'ethereum'
    }
  }

  let nodeType = rparams.get('node_type') || ''
  if (nodeType && !isNodeType(nodeType)) {
    throw `invalid 3RN node type: ${nodeType}`
  }

  if (nodeType) {
    //sleep
  } else if (name.startsWith('0x')) {
    nodeType = NodeType.Crypto
  } else if (name.endsWith('.eth')) {
    nodeType = NodeType.Crypto
  } else {
    throw `cannot determine node type: ${urn}`
  }

  const addressURN = AddressURNSpace.urn(name)

  console.log('parse3RN', { name, addrType, nodeType, rparams, addressURN })

  return next({
    ctx: {
      ...ctx,
      rparams,
      addressURN,
      addrType,
      nodeType,
      params: new URLSearchParams(qcomponent as string),
    },
  })
}
