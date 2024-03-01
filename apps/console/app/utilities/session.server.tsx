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
  Session,
} from '@remix-run/cloudflare'

import createCoreClient from '@proofzero/platform-clients/core'
import {
  generateTraceContextHeaders,
  generateTraceSpan,
} from '@proofzero/platform-middleware/trace'

import { IdentityURNSpace } from '@proofzero/urns/identity'
import { decryptSession } from '@proofzero/utils/session'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import {
  checkToken,
  ExpiredTokenError,
  InvalidTokenError,
} from '@proofzero/utils/token'
import { Env } from 'bindings'

const getPassportSessionStorage = (env: Env, MAX_AGE = 7776000, /*60 * 60 * 24 * 90*/) =>
  createCookie('_rollup_session', {
    domain: env.COOKIE_DOMAIN,
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
export async function getUserSession(request: Request, env: Env) {
  const cookie = getPassportSessionStorage(env)
  const data = await cookie.parse(request.headers.get('Cookie'))
  if (!data) return ''

  if (typeof data === 'object' && data.cipher && data.iv) {
    try {
      return await decryptSession(env.SECRET_SESSION_KEY, data.cipher, data.iv)
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
export async function requireJWT(request: Request, env: Env) {
  const jwt = await getUserSession(request, env)

  try {
    const { sub: subject } = checkToken(jwt)
    if (!subject) throw InvalidTokenError

    const coreClient = createCoreClient(env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...generateTraceContextHeaders(generateTraceSpan()),
    })

    if (
      !IdentityURNSpace.is(subject) ||
      !(await coreClient.identity.isValid.query())
    )
      throw InvalidTokenError
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

        throw redirect(`${env.PASSPORT_URL}/authorize?${qp.toString()}`)
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

export async function destroyUserSession(request: Request, redirectTo: string, env: Env) {
  const cookie = getPassportSessionStorage(env)
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await cookie.serialize('', { expires: new Date(0) }),
    },
  })
}


export function getFlashSessionStorage(env: Env) {
  const result = createCookieSessionStorage({
    cookie: {
      name: '_flashes',
      secrets: [env.SECRET_SESSION_SALT],
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10,
    },
  })
  return result
}

export function getFlashSession(request: Request, env: Env) {
  const storage = getFlashSessionStorage(env)
  return storage.getSession(request.headers.get('Cookie'))
}

export function commitFlashSession(
  session: Session,
  env: Env,
) {
  const storage = getFlashSessionStorage(env)
  return storage.commitSession(session)
}