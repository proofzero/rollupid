import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'
import { BaseMiddlewareFunction } from '@kubelt/platform-middleware/types'

import { Context } from '../../context'
import { isValidAddressType } from '../../utils'
import { PlatformAddressURNHeader } from '@kubelt/types/headers'

export const parse3RN: BaseMiddlewareFunction<Context> = async ({
  ctx,
  next,
}) => {
  const header =
    ctx.address3RN || ctx.req?.headers.get(PlatformAddressURNHeader)
  if (!header) {
    throw new Error(`missing ${PlatformAddressURNHeader} header`)
  }
  const addressURN = header as AddressURN
  const hashedIdref = AddressURNSpace.decode(addressURN)

  if (!hashedIdref) {
    throw `missing ${PlatformAddressURNHeader} name: ${addressURN}`
  }

  const { rcomponent, qcomponent } =
    AddressURNSpace.componentizedParse(addressURN)

  const addrType = rcomponent?.addr_type
  const alias = qcomponent?.alias

  // if (!addrType) {
  //   throw `cannot determine node type: ${addressURN}. Please provide a node_type or addr_type r-component.`
  // }

  const nodeType = addrType
    ? isValidAddressType(addrType)
    : rcomponent?.node_type

  // if (!nodeType) {
  //   throw `invalid 3RN address type: ${addrType}`
  // }

  console.log('parse3RN', {
    hashedIdref,
    addrType,
    nodeType,
    alias,
    addressURN,
  })

  return next({
    ctx: {
      ...ctx,
      addressURN,
      addrType,
      nodeType,
      alias,
      hashedIdref,
    },
  })
}
