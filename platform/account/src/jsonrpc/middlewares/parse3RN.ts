import { AccountURN, AccountURNSpace } from '@proofzero/urns/account'
import { BaseMiddlewareFunction } from '@proofzero/platform-middleware/types'

import { Context } from '../../context'
import { isValidAccountType } from '../../utils'
import { PlatformAccountURNHeader } from '@proofzero/types/headers'

export const parse3RN: BaseMiddlewareFunction<Context> = async ({
  ctx,
  next,
}) => {
  const header =
    ctx.account3RN || ctx.req?.headers.get(PlatformAccountURNHeader)
  if (!header) {
    return next({ ctx })
  }
  const accountURN = header as AccountURN
  const hashedIdref = AccountURNSpace.decode(accountURN)

  if (!hashedIdref) {
    throw `missing ${PlatformAccountURNHeader} name: ${accountURN}`
  }

  const { rcomponent, qcomponent } =
    AccountURNSpace.componentizedParse(accountURN)

  const addrType = rcomponent?.addr_type
  const alias = qcomponent?.alias

  // if (!addrType) {
  //   throw `cannot determine node type: ${accountURN}. Please provide a node_type or addr_type r-component.`
  // }

  const nodeType = addrType
    ? isValidAccountType(addrType)
    : rcomponent?.node_type

  // if (!nodeType) {
  //   throw `invalid 3RN account type: ${addrType}`
  // }

  console.log('parse3RN', {
    hashedIdref,
    addrType,
    nodeType,
    alias,
    accountURN,
  })

  return next({
    ctx: {
      ...ctx,
      accountURN,
      addrType,
      nodeType,
      alias,
      hashedIdref,
    },
  })
}
