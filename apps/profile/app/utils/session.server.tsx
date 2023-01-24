import { json, Session } from '@remix-run/cloudflare'
import { createCookieSessionStorage, redirect } from '@remix-run/cloudflare'
import * as jose from 'jose'
import type { JWTPayload } from 'jose'

// @ts-ignore
const sessionSecret = SECRET_SESSION_SALT
if (!sessionSecret) {
  throw new Error('SECRET_SESSION_SALT must be set')
}

const storage = createCookieSessionStorage({
  cookie: {
    name: '3ID_SESSION',
    domain: COOKIE_DOMAIN,
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: true,
    secrets: [sessionSecret],
    sameSite: true,
    path: '/',
    maxAge: 60 * 60 * 4,
    // httpOnly: true,
  },
})

// TODO: reset cookie maxAge if valid
export function getUserSession(request: Request, renew: boolean = true) {
  return storage.getSession(request.headers.get('Cookie'))
}

export async function destroyUserSession(session: Session) {
  return redirect('/', {
    headers: {
      'Set-Cookie': await storage.destroySession(session),
    },
  })
}

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

  // eventSubmit("3ID user event", `request:${request.url}`, session.get("core"))

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
