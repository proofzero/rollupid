import * as jose from 'jose'
import { BaseMiddlewareFunction } from '@kubelt/platform-middleware/types'
import { AccessURNSpace } from '@kubelt/urns/access'
import { initAccessNodeByName } from '../../nodes'
import { Context } from '../../context'

export const setAccessNode: BaseMiddlewareFunction<Context> = async ({
  next,
  ctx,
}) => {
  // Extract access node ID from JWT `iss` claim. The Access durable
  // object is the token issuer.
  if (!ctx.token) throw new Error('No token found in middleware context')
  const jwt = jose.decodeJwt(ctx.token)

  if (!jwt.iss) {
    throw new Error('missing JWT "iss" claim')
  }
  if (!AccessURNSpace.is(jwt.iss)) {
    throw new Error(`invalid accessURN: ${jwt.iss}`)
  }

  const accessNode = await initAccessNodeByName(jwt.iss, ctx.Access)

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
