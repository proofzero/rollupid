import { RollupError } from '@proofzero/errors'
import { IdentityURNSpace, type IdentityURN } from '@proofzero/urns/identity'
import { getAuthzTokenFromReq } from '@proofzero/utils'
import { checkToken } from '@proofzero/utils/token'

import { BaseMiddlewareFunction } from './types'

export const AuthorizationTokenFromHeader: BaseMiddlewareFunction<{
  req?: Request
  token?: string
}> = ({ ctx, next }) => {
  if (ctx.token) return next({ ctx })
  const token = ctx.req ? getAuthzTokenFromReq(ctx.req) : undefined
  return next({
    ctx: {
      ...ctx,
      token,
    },
  })
}

export const ValidateJWT: BaseMiddlewareFunction<{
  token?: string
}> = ({ ctx, next }) => {
  if (ctx.token) {
    const { sub: subject } = checkToken(ctx.token)
    if (subject && IdentityURNSpace.is(subject)) {
      return next({
        ctx: {
          ...ctx,
          identityURN: subject,
        },
      })
    }
  }

  return next({ ctx })
}

/**
 * Require that a valid identity be defined on the context.
 *
 * Typically this will be obtained by first using the ValidateJWT
 * middleware which extracts the identity details from an incoming
 * JWT, but other possibilities may arise. The ValidateJWT middleware
 * doesn't error in the case that the JWT/identity is not provided,
 * instead passing an undefined identity value to the handler (which
 * may be what is needed if handler must branch on the presence or
 * absence of the identity).
 *
 * This middleware throws if the identity is not defined on the
 * context or is not valid.
 */
export const RequireIdentity: BaseMiddlewareFunction<{
  identityURN?: IdentityURN
}> = ({ ctx, next }) => {
  if (!ctx?.identityURN) {
    throw new Error(`missing identity`)
  }

  if (!IdentityURNSpace.is(ctx?.identityURN)) {
    throw new Error(`invalid identity: ${ctx?.identityURN}`)
  }

  return next({
    ctx,
  })
}
