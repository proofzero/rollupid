import {
  createCookieSessionStorage,
  // createCloudflareKVSessionStorage,
  redirect,
} from '@remix-run/cloudflare'
import type { Session } from '@remix-run/cloudflare'

import * as jose from 'jose'
import type { JWTPayload } from 'jose'

// @ts-ignore
const sessionSecret = SESSION_SECRET
if (!sessionSecret) {
  throw new Error('SESSION_SECRET must be set')
}

const storage = createCookieSessionStorage({
  cookie: {
    name: '3ID_SESSION',
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

export async function createUserSession(
  jwt: string,
  redirectTo: string,
  address?: string // NOTE: storing this temporarily in the session util RPC url remove address
) {
  const parsedJWT = parseJwt(jwt)
  const session = await storage.getSession()
  session.set('core', parsedJWT.iss)
  session.set('jwt', jwt)
  session.set('address', address)
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  })
}

// TODO: reset cookie maxAge if valid
export function getUserSession(request: Request, renew: boolean = true) {
  return storage.getSession(request.headers.get('Cookie'))
}

export async function destroyUserSession(
  session: Session,
  searchParams: URLSearchParams
) {
  return redirect(`/authenticate?${searchParams}`, {
    headers: {
      'Set-Cookie': await storage.destroySession(session),
    },
  })
}

// export async function isValidJWT(request: Request): Promise<boolean> {
//   const session = await getUserSession(request)
//   const jwt = session.get('jwt')
//   if (!jwt) {
//     return false
//   }
//   const parsedJWT = parseJwt(jwt)
//   const { exp } = parsedJWT
//   if (exp < Date.now() / 1000) {
//     throw await destroyUserSession(session)
//   }
//   return true
// }

export async function requireJWT(
  request: Request,
  searchParams: URLSearchParams = new URLSearchParams(request.url)
) {
  const session = await getUserSession(request)
  const jwt = session.get('jwt')

  if (!jwt || typeof jwt !== 'string') {
    throw redirect(`/authenticate?${searchParams}`)
  }
  if (jwt) {
    const parsedJWT = parseJwt(jwt)
    if (parsedJWT.exp < Date.now() / 1000) {
      throw await destroyUserSession(session, searchParams)
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
