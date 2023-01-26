import { createCookieSessionStorage, redirect } from '@remix-run/cloudflare'
import { Authenticator } from 'remix-auth'
import { OAuth2Strategy, OAuth2Profile } from 'remix-auth-oauth2'
import * as jose from 'jose'
import type { JWTPayload } from 'jose'

// @ts-ignore
const sessionSecret = SECRET_SESSION_SALT
if (!sessionSecret) {
  throw new Error('SECRET_SESSION_SALT must be set')
}

const getProfileSessionStorage = () =>
  createCookieSessionStorage({
    cookie: {
      domain: COOKIE_DOMAIN,
      httpOnly: true,
      name: '_rollup_profile_oauth',
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 90,
      secrets: [sessionSecret],
    },
  })

export const initAuthenticator = () => {
  const oauthStorage = getProfileSessionStorage()
  return new Authenticator<RollupAuth>(oauthStorage)
}
export const getRollupAuthenticator = () => {
  const authenticator = initAuthenticator()
  const rollupStrategy = new OAuth2Strategy<RollupAuth, OAuth2Profile>(
    {
      authorizationURL: PASSPORT_AUTH_URL,
      tokenURL: PASSPORT_TOKEN_URL,
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: REDIRECT_URI,
    },
    async ({ accessToken, refreshToken, extraParams, context }) => {
      return { accessToken, refreshToken, extraParams }
    }
  )
  authenticator.use(rollupStrategy, 'rollup')
  return authenticator
}

// our authenticate function receives the Request, the Session and a Headers
// we make the headers optional so loaders don't need to pass one
// https://sergiodxa.com/articles/working-with-refresh-tokens-in-remix
export async function requireJWT(request: Request, headers = new Headers()) {
  const AuthorizationError = class extends Error {}

  const session = await getProfileSession(request)
  const accessToken = session.get('accessToken')

  try {
    // if not found, redirect to login, this means the user is not even logged-in
    if (!accessToken) throw redirect('/auth')

    const parsedToken = parseJwt(accessToken)

    // if expired throw an error (we can extends Error to create this)
    if (!parsedToken.exp || parsedToken.exp >= Date.now()) {
      throw new AuthorizationError('Expired')
    }

    // if not expired, return the access token
    return accessToken
  } catch (error) {
    // here, check if the error is an AuthorizationError (the one we throw above)
    if (error instanceof AuthorizationError) {
      const refreshToken = session.get('refreshToken')

      const form = new FormData()
      form.append('grant_type', 'refresh_token')
      form.append('refresh_token', refreshToken)
      // refresh the access token
      const token = await fetch(PASSPORT_TOKEN_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        body: form,
      })

      if (!token.ok) {
        const error = await token.text()
        throw new Error(error)
      }

      const { access_token, refresh_token } = await token.json<{
        access_token: string
        refresh_token: string
      }>()

      // update the session with the new values
      session.set('accessToken', access_token)
      session.set('refreshToken', refresh_token)

      // commit the session and append the Set-Cookie header
      headers.append(
        'Set-Cookie',
        await getProfileSessionStorage().commitSession(session)
      )

      // redirect to the same URL if the request was a GET (loader)
      if (request.method === 'GET') throw redirect(request.url, { headers })

      // return the access token so you can use it in your action
      return accessToken
    }

    // throw again any unexpected error that could've happened
    throw error
  }
}

export function parseJwt(token: string): JWTPayload {
  const payload = jose.decodeJwt(token)
  if (!payload) {
    throw new Error('Invalid JWT')
  }
  return payload
}

// TODO: reset cookie maxAge if valid
export function getProfileSession(request: Request, renew: boolean = true) {
  const storage = getProfileSessionStorage()
  return storage.getSession(request.headers.get('Cookie'))
}
