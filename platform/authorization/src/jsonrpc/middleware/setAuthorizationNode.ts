import { decodeJwt } from 'jose'

import { AuthorizationURNSpace } from '@proofzero/urns/authorization'
import { IdentityURNSpace } from '@proofzero/urns/identity'
import { AuthorizationJWTPayload } from '@proofzero/types/authorization'
import { BaseMiddlewareFunction } from '@proofzero/platform-middleware/types'

import { initIdentityNodeByName } from '@proofzero/platform.identity/src/nodes'

import { initAuthorizationNodeByName } from '../../nodes'
import { Context } from '../../context'

export const setAuthorizationNode: BaseMiddlewareFunction<Context> = async ({
  next,
  ctx,
}) => {
  // Extract authorization node ID from JWT `iss` claim. The Authorization durable
  // object is the token issuer.
  if (!ctx.token) throw new Error('No token found in middleware context')

  const jwt = decodeJwt(ctx.token) as AuthorizationJWTPayload
  const [clientId] = jwt.aud

  if (!clientId) {
    throw new Error('missing client id in the aud claim')
  }

  if (!IdentityURNSpace.is(jwt.sub)) {
    throw new Error(`missing identity in the sub claim`)
  }

  const identityNode = initIdentityNodeByName(jwt.sub, ctx.env.Identity)
  const forwardIdentityURN = await identityNode.class.getForwardIdentityURN()
  const identityURN = forwardIdentityURN || jwt.sub

  const nss = `${IdentityURNSpace.decode(identityURN)}@${clientId}`
  const urn = AuthorizationURNSpace.componentizedUrn(nss)
  const authorizationNode = initAuthorizationNodeByName(
    urn,
    ctx.env.Authorization
  )

  if (!authorizationNode) {
    throw new Error('unable to get authorization node client')
  }

  return await next({
    ctx: {
      ...ctx,
      authorizationNode,
    },
  })
}
