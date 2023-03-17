import type { AccountURN } from '@proofzero/urns/account'
import { AccountURNSpace } from '@proofzero/urns/account'
import * as jose from 'jose'
import { BaseMiddlewareFunction } from './types'
import { getAuthzTokenFromReq } from '@proofzero/utils'

export const AuthorizationTokenFromHeader: BaseMiddlewareFunction<{
  req?: Request
}> = ({ ctx, next }) => {
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
  if (!ctx.token) throw new Error('No token found in middleware context')

  const jwt = ctx.token !== 'null' ? jose.decodeJwt(ctx.token) : undefined

  // TODO: validate token

  const accountURN = jwt ? (jwt.sub as AccountURN) : undefined

  return next({
    ctx: {
      ...ctx,
      accountURN,
    },
  })
}

/**
 * Require that a valid account be defined on the context.
 *
 * Typically this will be obtained by first using the ValidateJWT
 * middleware which extracts the account details from an incoming JWT,
 * but other possibilities may arise. The ValidateJWT middleware doesn't
 * error in the case that the JWT/account is not provided, instead
 * passing an undefined account value to the handler (which may be what
 * is needed if handler must branch on the presence or absence of the
 * account).
 *
 * This middleware throws if the account is not defined on the context
 * or is not valid.
 */
export const RequireAccount: BaseMiddlewareFunction<{
  accountURN?: AccountURN
}> = ({ ctx, next }) => {
  if (!ctx?.accountURN) {
    throw new Error(`missing account`)
  }

  if (!AccountURNSpace.is(ctx?.accountURN)) {
    throw new Error(`invalid account: ${ctx?.accountURN}`)
  }

  return next({
    ctx,
  })
}
