import { createCookieSessionStorage, json } from '@remix-run/cloudflare'
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
