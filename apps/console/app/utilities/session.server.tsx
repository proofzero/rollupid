/**
 * @file app/shared/utilities/session.server.tsx
 */

import invariant from 'tiny-invariant'
import * as jose from 'jose'
import type { JWTPayload } from 'jose'
import {
  createCookieSessionStorage,
  // createCloudflareKVSessionStorage,
  redirect,
} from '@remix-run/cloudflare'

// @ts-ignore
invariant(DEPLOY_ENV, 'DEPLOY_ENV must be set')

// NB: This secret is set using: wrangler secret put.
// @ts-ignore
invariant(SECRET_SESSION_SALT, 'SECRET_SESSION_SALT must be set')

// @ts-ignore
invariant(COOKIE_DOMAIN, 'COOKIE_DOMAIN must be set')

// Definitions
// -----------------------------------------------------------------------------

const MAX_AGE = 60 * 60 * 24 * 90 // 90 days

// createCookieSessionStorage
// -----------------------------------------------------------------------------
// TODO load the SECRET_SESSION_SALT from context injected into Loader and
// use that to construct a Singleton for the session

const getPassportSessionStorage = (age: number = MAX_AGE) =>
  createCookieSessionStorage({
    cookie: {
      domain: COOKIE_DOMAIN,
      httpOnly: true,
      name: 'PASSPORT_SESSION',
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
  // const searchParams = new URLSearchParams([['redirectTo', redirectTo]])

  if (!jwt || typeof jwt !== 'string') {
    throw redirect(`${PASSPORT_URL}/signout`)
  }
  if (jwt) {
    const parsedJWT = parseJwt(jwt)
    const exp = parsedJWT?.exp
    if (exp && exp < Date.now() / 1000) {
      throw redirect(`${PASSPORT_URL}/signout`)
    }
  }

  // eventSubmit("Rollup user event", `request:${request.url}`, session.get("core"))

  return jwt
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
