import type { AccountURN } from '@kubelt/urns/account'
import { AccountURNSpace } from '@kubelt/urns/account'
import * as jose from 'jose'
import { BaseMiddlewareFunction } from './types'

export const PlatformJWTAssertionHeader = 'KBT-Access-JWT-Assertion'

export const JWTAssertionTokenFromHeader: BaseMiddlewareFunction<{
  req?: Request
}> = ({ ctx, next }) => {
  const headers = ctx.req?.headers
  const token = headers?.get(PlatformJWTAssertionHeader)
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
  const jwt = jose.decodeJwt(ctx.token)

  // TODO: validate token

  const accountURN: AccountURN = jwt && (jwt.sub as AccountURN)

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
  accountURN?: string
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
