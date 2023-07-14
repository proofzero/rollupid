/**
 * @file app/shared/utilities/session.server.tsx
 */

import invariant from 'tiny-invariant'
import * as jose from 'jose'
import type { JWTPayload } from 'jose'
import {
  createCookie,
  redirect,
  createCookieSessionStorage,
} from '@remix-run/cloudflare'

import { decryptSession } from '@proofzero/utils/session'

import {
  checkToken,
  ExpiredTokenError,
  InvalidTokenError,
} from '@proofzero/utils/token'

const getPassportSessionStorage = (MAX_AGE = 7776000 /*60 * 60 * 24 * 90*/) =>
  createCookie('_rollup_session', {
    domain: COOKIE_DOMAIN,
    httpOnly: true,
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: MAX_AGE,
  })

// getUserSession
// -----------------------------------------------------------------------------

/**
 * @todo reset cookie maxAge if valid
 */
export async function getUserSession(request: Request) {
  const cookie = getPassportSessionStorage()
  const data = await cookie.parse(request.headers.get('Cookie'))
  if (!data) return ''

  if (typeof data === 'object' && data.cipher && data.iv) {
    try {
      return await decryptSession(SECRET_SESSION_KEY, data.cipher, data.iv)
    } catch (error) {
      console.error('getUserSession:decryptSession()', error)
    }
  }

  return ''
}

// requireJWT
// -----------------------------------------------------------------------------

/**
 * @return an encoded JWT
 */
export async function requireJWT(request: Request) {
  const jwt = await getUserSession(request)

  try {
    checkToken(jwt)
    return jwt
  } catch (error) {
    switch (error) {
      case ExpiredTokenError:
      case InvalidTokenError:
        const url = new URL(request.url)
        const { href } = url

        const qp = new URLSearchParams()
        qp.append('client_id', 'console')
        qp.append('redirect_uri', `${href}`)

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
    throw InvalidTokenError
  }
  return payload
}

export async function destroyUserSession(request: Request, redirectTo: string) {
  const cookie = getPassportSessionStorage()
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await cookie.serialize('', { expires: new Date(0) }),
    },
  })
}

export const {
  getSession: getFlashSession,
  commitSession: commitFlashSession,
  destroySession: destroyFlashSession,
} = createCookieSessionStorage({
  cookie: {
    name: '_flashes',
    secrets: [SECRET_SESSION_SALT],
    secure: process.env.NODE_ENV === 'production',
    maxAge: 10,
  },
})
