import type { Session } from '@remix-run/cloudflare'
import { createCookieSessionStorage, redirect } from '@remix-run/cloudflare'

type OortJwt = {
  aud: string[]
  iss: string
  sub: string
  exp: number
  iat: number
  capabilities: object
}

// @ts-ignore
const sessionSecret = SESSION_SECRET
if (!sessionSecret) {
  throw new Error('SESSION_SECRET must be set')
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

export function parseJwt(token: string): OortJwt {
  var base64Url = token.split('.')[1]
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  var jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      })
      .join('')
  )

  return JSON.parse(jsonPayload)
}
