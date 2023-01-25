import { Session } from '@remix-run/cloudflare'
import { createCookieSessionStorage, redirect } from '@remix-run/cloudflare'
import * as jose from 'jose'
import type { JWTPayload } from 'jose'

// @ts-ignore
const sessionSecret = SECRET_SESSION_SALT
if (!sessionSecret) {
  throw new Error('SECRET_SESSION_SALT must be set')
}

export async function requireJWT(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await getProfileSession(request)
  const jwt = session.get('jwt')

  if (!jwt || typeof jwt !== 'string') {
    throw redirect(PASSPORT_URL)
  }
  if (jwt) {
    const parsedJWT = parseJwt(jwt)
    if (parsedJWT.exp < Date.now() / 1000) {
      throw await destroyProfileSession(session)
    }
  }

  return jwt
}

export function parseJwt(token: string): JWTPayload {
  const payload = jose.decodeJwt(token)
  if (!payload) {
    throw new Error('Invalid JWT')
  }
  return payload
}

// Authorize Cookie

const getAuthorizeStateStorage = () => {
  return createCookieSessionStorage({
    cookie: {
      domain: COOKIE_DOMAIN,
      name: 'PROFILE_AUTH_STATE',
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV == 'production',
      maxAge: 60 * 5,
      httpOnly: true,
      secrets: [sessionSecret],
    },
  })
}

export async function createAuthorizeStateSession(
  state: string,
  redirectURL: string
) {
  const storage = getAuthorizeStateStorage()
  const session = await storage.getSession()
  session.set('state', state)

  return redirect(redirectURL, {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  })
}

export async function getAuthorizeStateSession(request: Request) {
  const storage = getAuthorizeStateStorage()
  return storage.getSession(request.headers.get('Cookie'))
}

// NEW SESSION

const getProfileSessionStorage = () => {
  return createCookieSessionStorage({
    cookie: {
      domain: COOKIE_DOMAIN,
      name: 'PROFILE_SESSION',
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV == 'production',
      maxAge: 60 * 60 * 24 * 120,
      httpOnly: true,
      secrets: [sessionSecret],
    },
  })
}

export async function createProfileSession(jwt: string, redirectTo: string) {
  const userStorage = getProfileSessionStorage()
  const parsedJWT = parseJwt(jwt)
  const userSession = await userStorage.getSession()
  userSession.set('core', parsedJWT.iss)
  userSession.set('jwt', jwt)

  const headers = new Headers()
  headers.append('Set-Cookie', await userStorage.commitSession(userSession))

  return redirect(redirectTo, {
    headers,
  })
}

// TODO: reset cookie maxAge if valid
export function getProfileSession(request: Request, renew: boolean = true) {
  const storage = getProfileSessionStorage()
  return storage.getSession(request.headers.get('Cookie'))
}

export async function destroyProfileSession(session: Session) {
  const storage = getProfileSessionStorage()
  const cookie = await storage.destroySession(session)
  return redirect('https://threeid.xyz/profiles', {
    headers: {
      'Set-Cookie': cookie,
    },
  })
}
