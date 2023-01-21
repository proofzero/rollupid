import {
  createCookieSessionStorage,
  json,
  redirect,
} from '@remix-run/cloudflare'
import { Authenticator } from 'remix-auth'

const sessionSecret = SECRET_SESSION_SALT
if (!sessionSecret) {
  throw new Error('SECRET_SESSION_SALT must be set')
}

// params parser

export function parseParams(request: Request, validate?: boolean) {
  const url = new URL(request.url)
  const clientId = url.searchParams.get('client_id')
  const state = url.searchParams.get('state')
  const redirectUri = url.searchParams.get('redirect_uri')
  const scope = url.searchParams.get('scope')

  if (validate) {
    if (!clientId) throw json({ message: 'client_id is required' }, 400)
    if (!state) throw json({ message: 'state is required' }, 400)
    if (!redirectUri) throw json({ message: 'redirect_uri is required' }, 400)
  }

  return {
    clientId,
    state,
    redirectUri,
    scope,
  }
}

// OAuth state

export const oauthStorage = createCookieSessionStorage({
  cookie: {
    domain: COOKIE_DOMAIN,
    httpOnly: true,
    name: 'oauth',
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 4,
    secrets: [sessionSecret],
  },
})

export const authenticator = new Authenticator(oauthStorage)

// 0xAuth state

export async function create0xAuthSession(
  provider: string,
  clientId: string,
  state: string,
  redirectUri: string,
  scope: string,
  redirectTo: string
) {
  const oxstorage = createCookieSessionStorage({
    cookie: {
      domain: COOKIE_DOMAIN,
      path: '/authorize',
      sameSite: 'lax',
      secure: process.env.NODE_ENV == 'production',
      maxAge: 60 * 5,
      httpOnly: true,
      secrets: [sessionSecret],
    },
  })

  const session = await oxstorage.getSession()
  session.set('provider', provider)
  session.set('clientId', clientId)
  session.set('state', state)
  session.set('redirectUri', redirectUri)
  session.set('scope', scope)

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await oxstorage.commitSession(session),
    },
  })
}

export async function get0xAuthSession(
  request: Request,
  callbackProvider: string
) {
  const params = new URL(request.url).searchParams

  const clientId = params.get('clientId')
  if (!clientId) throw json({ message: 'client_id is required' }, 400)

  const state = params.get('state')
  if (!state) throw json({ message: 'state is required' }, 400)

  const redirectUri = params.get('redirectUri')
  if (!redirectUri) throw json({ message: 'redirect_uri is required' }, 400)

  const provider = params.get('provider')
  if (!provider || provider !== callbackProvider)
    throw json({ message: 'provider is required' }, 400)

  const scope = params.get('scope')?.split(',') || []

  const oxstorage = createCookieSessionStorage({
    cookie: {
      domain: COOKIE_DOMAIN,
      name: `${provider}-${clientId}`,
      path: '/authorize',
      sameSite: 'lax',
      secure: process.env.NODE_ENV == 'production',
      maxAge: 60 * 5,
      httpOnly: true,
      secrets: [sessionSecret],
    },
  })
  const session = await oxstorage.getSession(request.headers.get('Cookie'))
  return session
}
