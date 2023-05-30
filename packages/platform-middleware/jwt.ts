import { RollupError } from '@proofzero/errors'
import type { AccountURN } from '@proofzero/urns/account'
import { AccountURNSpace } from '@proofzero/urns/account'
import { getAuthzTokenFromReq } from '@proofzero/utils'
import { verifyToken } from '@proofzero/utils/token'

import { BaseMiddlewareFunction } from './types'

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
  JWKS_INTERNAL_URL_BASE: string
}> = async ({ ctx, next }) => {
  if (ctx.token) {
    try {
      const { sub: subject } = await verifyToken(
        ctx.token,
        ctx.JWKS_INTERNAL_URL_BASE
      )
      if (subject && AccountURNSpace.is(subject)) {
        return next({
          ctx: {
            ...ctx,
            accountURN: subject,
          },
        })
      }
    } catch (error) {
      if (error instanceof RollupError) return next({ ctx })
      else throw error
    }
  }

  return next({ ctx })
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
