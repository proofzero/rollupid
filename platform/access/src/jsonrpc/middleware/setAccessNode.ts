import { decodeJwt } from 'jose'

import { AccountURNSpace } from '@kubelt/urns/account'
import { AccessJWTPayload } from '@kubelt/types/access'
import { BaseMiddlewareFunction } from '@kubelt/platform-middleware/types'

import { initAccessNodeByName } from '../../nodes'
import { Context } from '../../context'

export const setAccessNode: BaseMiddlewareFunction<Context> = async ({
  next,
  ctx,
}) => {
  // Extract access node ID from JWT `iss` claim. The Access durable
  // object is the token issuer.
  if (!ctx.token) throw new Error('No token found in middleware context')

  const jwt = decodeJwt(ctx.token) as AccessJWTPayload
  const account = jwt.sub
  const [clientId] = jwt.aud

  if (!clientId) {
    throw new Error('missing client id in the aud claim')
  }

  if (!AccountURNSpace.is(account)) {
    throw new Error(`missing account in the sub claim`)
  }

  const name = `${AccountURNSpace.decode(account)}@${clientId}`
  const accessNode = await initAccessNodeByName(name, ctx.Access)

  if (!accessNode) {
    throw new Error('unable to get access node client')
  }

  return await next({
    ctx: {
      ...ctx,
      accessNode,
    },
  })
}
