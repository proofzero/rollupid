import { AccountURN } from '@kubelt/urns/account'
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

  // TODO: validate accountURN

  return next({
    ctx: {
      ...ctx,
      accountURN,
    },
  })
}
