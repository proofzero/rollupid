/**
 * @file app/shared/utilities/session.server.tsx
 */

import invariant from 'tiny-invariant'
import * as jose from 'jose'
import type { JWTPayload } from 'jose'
import { createCookieSessionStorage, redirect } from '@remix-run/cloudflare'

import {
  checkToken,
  ExpiredTokenError,
  InvalidTokenError,
} from '@proofzero/utils/token'

// @ts-ignore
invariant(DEPLOY_ENV, 'DEPLOY_ENV must be set')

// NB: This secret is set using: wrangler secret put.
// @ts-ignore
invariant(SECRET_SESSION_SALT, 'SECRET_SESSION_SALT must be set')

// @ts-ignore
invariant(COOKIE_DOMAIN, 'COOKIE_DOMAIN must be set')

// createCookieSessionStorage
// -----------------------------------------------------------------------------
// TODO load the SECRET_SESSION_SALT from context injected into Loader and
// use that to construct a Singleton for the session

const getPassportSessionStorage = (MAX_AGE = 7776000 /*60 * 60 * 24 * 90*/) =>
  createCookieSessionStorage({
    cookie: {
      domain: COOKIE_DOMAIN,
      httpOnly: true,
      name: '_rollup_session',
      path: '/',
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: MAX_AGE,
      secrets: [SECRET_SESSION_SALT],
    },
  })

// getUserSession
// -----------------------------------------------------------------------------

/**
 * @todo reset cookie maxAge if valid
 */
export function getUserSession(request: Request, renew: boolean = true) {
  // TODO can headers be optional here?
  return getPassportSessionStorage().getSession(request?.headers.get('Cookie'))
}

// requireJWT
// -----------------------------------------------------------------------------

/**
 * @return an encoded JWT
 */
export async function requireJWT(request: Request) {
  const session = await getUserSession(request)
  const jwt = session.get('jwt')

  try {
    checkToken(jwt)
    return jwt
  } catch (error) {
    switch (error) {
      case ExpiredTokenError:
      case InvalidTokenError:
        const qp = new URLSearchParams()
        qp.append('client_id', 'console')
        // TODO: this should be the current URL
        qp.append('redirect_uri', 'http://localhost:10002')

        qp.append('scope', '')
        qp.append('state', 'skip')

        throw redirect(`${PASSPORT_URL}/authorize?${qp.toString()}`)
    }
  }
}

/**
 *
 */
export function parseJwt(token: string): JWTPayload {
  const payload = jose.decodeJwt(token)
  if (!payload) {
    throw new Error('Invalid JWT')
  }
  return payload
}
