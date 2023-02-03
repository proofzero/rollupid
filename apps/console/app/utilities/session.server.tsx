/**
 * @file app/shared/utilities/session.server.tsx
 */

import invariant from 'tiny-invariant'
import * as jose from 'jose'
import type { JWTPayload } from 'jose'
import type { Session } from '@remix-run/cloudflare'
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
// use that to construct a Singleton for the session storage.
//
// TODO switch to using a CloudflareKVSessionStorage.

/**
 *
 */
const storage = createCookieSessionStorage({
  cookie: {
    name: 'PASSPORT_SESSION',
    domain: COOKIE_DOMAIN,
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === 'production',
    secrets: [SECRET_SESSION_SALT],
    sameSite: 'strict',
    path: '/',
    maxAge: MAX_AGE,
    httpOnly: true,
  },
})

// getUserSession
// -----------------------------------------------------------------------------

/**
 * @todo reset cookie maxAge if valid
 */
export function getUserSession(request: Request, renew: boolean = true) {
  // TODO can headers be optional here?
  return storage.getSession(request?.headers.get('Cookie'))
}

// destroyUserSession
// -----------------------------------------------------------------------------

/**
 *
 */
export async function destroyUserSession(session: Session) {
  return redirect('/', {
    headers: {
      'Set-Cookie': await storage.destroySession(session),
    },
  })
}

// logout
// -----------------------------------------------------------------------------

/**
 *
 */
export async function logout(request: Request) {
  const session = await getUserSession(request)
  return destroyUserSession(session)
}

// requireJWT
// -----------------------------------------------------------------------------

/**
 * @return an encoded JWT
 */
export async function requireJWT(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await getUserSession(request)
  const jwt = session.get('jwt')
  // const searchParams = new URLSearchParams([['redirectTo', redirectTo]])

  if (!jwt || typeof jwt !== 'string') {
    throw redirect(PASSPORT_URL)
  }
  if (jwt) {
    const parsedJWT = parseJwt(jwt)
    if (parsedJWT.exp < Date.now() / 1000) {
      throw await destroyUserSession(session)
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
