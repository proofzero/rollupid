import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'
import { BaseMiddlewareFunction } from '@kubelt/platform-middleware/types'

import { HEADER_3RN } from '../../constants'
import { Context } from '../../context'
import { isValidAddressType } from '../../utils'

export const parse3RN: BaseMiddlewareFunction<Context> = async ({
  ctx,
  next,
}) => {
  const header = ctx.address3RN || ctx.req?.headers.get(HEADER_3RN)
  if (!header) {
    throw new Error('missing X-3RN header')
  }
  let addressURN = header as AddressURN
  const hashedIdref = AddressURNSpace.decode(addressURN)

  if (!hashedIdref) {
    throw `missing 3RN name: ${addressURN}`
  }

  const { rcomponent, qcomponent } = AddressURNSpace.parse(addressURN)
  const rparams = new URLSearchParams(rcomponent || '')
  const qparams = new URLSearchParams(qcomponent || '')

  const addrType = rparams.get('addr_type')
  const alias = qparams.get('alias')

  if (!addrType) {
    throw `cannot determine node type: ${addressURN}. Please provide a node_type or addr_type r-component.`
  }

  const nodeType = isValidAddressType(addrType)

  if (!nodeType) {
    throw `invalid 3RN address type: ${addrType}`
  }

  // add the name qc param
  addressURN = `${AddressURNSpace.urn(hashedIdref)}`

  console.log('parse3RN', {
    hashedIdref,
    addrType,
    nodeType,
    alias,
    rparams,
    addressURN,
  })

  return next({
    ctx: {
      ...ctx,
      rparams,
      qparams,
      addressURN,
      addrType,
      nodeType,
      alias,
      hashedIdref,
      params: new URLSearchParams(qcomponent as string),
    },
  })
}
